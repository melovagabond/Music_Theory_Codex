import { useEffect, useMemo, useRef, useState } from "react";

type SimplifiedMidiAccess = {
  inputs: Map<string, MidiInput> | Iterable<MidiInput>;
  onstatechange: ((event: Event) => void) | null;
  addEventListener?: (
    type: "statechange",
    listener: (event: Event) => void
  ) => void;
  removeEventListener?: (
    type: "statechange",
    listener: (event: Event) => void
  ) => void;
  cleanup?: () => Promise<void> | void;
};

type MidiInput = {
  id: string;
  name?: string;
  manufacturer?: string;
  state?: string;
  onmidimessage: ((event: MidiMessageEvent) => void) | null;
  addEventListener?: (
    type: "midimessage",
    listener: (event: MidiMessageEvent) => void
  ) => void;
  removeEventListener?: (
    type: "midimessage",
    listener: (event: MidiMessageEvent) => void
  ) => void;
};

type MidiMessageEvent = {
  data: Uint8Array;
  target: MidiInput;
};

type NormalizedNoteMessage = {
  note: number;
  velocity: number;
  channel: number;
  type: "noteon" | "noteoff";
};

type NormalizedControlChange = {
  controller: number;
  value: number;
  channel: number;
};

type UseMidiInputOptions = {
  enabled?: boolean;
  onNoteOn?: (message: NormalizedNoteMessage) => void;
  onNoteOff?: (message: NormalizedNoteMessage) => void;
  onControlChange?: (message: NormalizedControlChange) => void;
};

type MidiStatus = "idle" | "pending" | "listening" | "unsupported" | "error";

type MidiProvider = "webmidi" | "serial" | "usb";

type MidiHookReturn = {
  supported: boolean;
  provider: MidiProvider | null;
  status: MidiStatus;
  permissionError: string | null;
  isEnabled: boolean;
  setIsEnabled: (value: boolean) => void;
  inputs: MidiInput[];
  selectedInputId: string | null;
  setSelectedInputId: (id: string | null) => void;
};

const normalizeMessage = (
  event: MidiMessageEvent,
  callbacks: Pick<
    UseMidiInputOptions,
    "onNoteOn" | "onNoteOff" | "onControlChange"
  >
) => {
  const [status, data1, data2 = 0] = event.data;
  const command = status & 0xf0;
  const channel = status & 0x0f;

  if (command === 0x90 && data2 > 0) {
    callbacks.onNoteOn?.({
      note: data1,
      velocity: data2,
      channel,
      type: "noteon",
    });
    return;
  }

  if (command === 0x80 || (command === 0x90 && data2 === 0)) {
    callbacks.onNoteOff?.({
      note: data1,
      velocity: data2,
      channel,
      type: "noteoff",
    });
    return;
  }

  if (command === 0xb0) {
    callbacks.onControlChange?.({
      controller: data1,
      value: data2,
      channel,
    });
  }
};

const midiByteBuffer = (emit: (data: Uint8Array) => void) => {
  const buffer: number[] = [];

  return {
    push: (bytes: Iterable<number>) => {
      for (const byte of bytes) {
        buffer.push(byte);

        while (buffer.length >= 3) {
          const chunk = buffer.splice(0, 3);
          emit(new Uint8Array(chunk));
        }
      }
    },
    clear: () => {
      buffer.length = 0;
    },
  };
};

const createMidiInputShim = (id: string, name: string) => {
  const listeners = new Set<(event: MidiMessageEvent) => void>();

  const input: MidiInput = {
    id,
    name,
    state: "connected",
    onmidimessage: null,
    addEventListener: (type, listener) => {
      if (type === "midimessage") {
        listeners.add(listener);
      }
    },
    removeEventListener: (type, listener) => {
      if (type === "midimessage") {
        listeners.delete(listener);
      }
    },
  };

  const emit = (data: Uint8Array) => {
    const event: MidiMessageEvent = { data, target: input };
    input.onmidimessage?.(event);
    listeners.forEach((listener) => listener(event));
  };

  return { input, emit };
};

const requestSerialMidiAccess = async (): Promise<SimplifiedMidiAccess> => {
  const nav = navigator as Navigator & { serial?: any };

  if (!nav.serial?.requestPort) {
    throw new Error("Web Serial is not available in this browser.");
  }

  const port = await nav.serial.requestPort();
  await port.open({ baudRate: 31250 });

  const reader = port.readable?.getReader();

  if (!reader) {
    throw new Error("Unable to read from the selected MIDI serial device.");
  }

  const { input, emit } = createMidiInputShim(
    "serial-midi-port",
    "Serial MIDI",
  );

  const buffer = midiByteBuffer(emit);

  const readLoop = async () => {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();

        if (done) break;
        if (value) {
          buffer.push(value as Iterable<number>);
        }
      }
    } catch (err) {
      console.error("Serial MIDI read error", err);
    } finally {
      buffer.clear();
      reader.releaseLock();
    }
  };

  readLoop();

  return {
    inputs: new Map([[input.id, input]]),
    onstatechange: null,
    cleanup: async () => {
      try {
        await reader.cancel();
        await port.close();
      } catch (err) {
        console.warn("Serial MIDI cleanup issue", err);
      }
    },
  };
};

const requestUsbMidiAccess = async (): Promise<SimplifiedMidiAccess> => {
  const nav = navigator as Navigator & { usb?: any };

  if (!nav.usb?.requestDevice) {
    throw new Error("WebUSB is not available in this browser.");
  }

  const device = await nav.usb.requestDevice({
    filters: [{ classCode: 1, subclassCode: 3 }],
  });

  await device.open();

  if (!device.configuration && device.configurations?.length) {
    await device.selectConfiguration(device.configurations[0].configurationValue);
  }

  const midiInterface = device.configuration?.interfaces.find((iface: any) =>
    iface.alternates?.some(
      (alt: any) => alt.interfaceClass === 1 && alt.interfaceSubclass === 3,
    ),
  );

  if (!midiInterface) {
    throw new Error("No MIDI-capable USB interface was found on this device.");
  }

  const alternate = midiInterface.alternates.find(
    (alt: any) => alt.interfaceClass === 1 && alt.interfaceSubclass === 3,
  );

  const endpoint = alternate?.endpoints?.find((ep: any) => ep.direction === "in");

  if (!endpoint) {
    throw new Error("The selected USB device has no readable MIDI endpoint.");
  }

  await device.claimInterface(midiInterface.interfaceNumber);

  const { input, emit } = createMidiInputShim("usb-midi-device", "USB MIDI");
  const buffer = midiByteBuffer(emit);

  const readLoop = async () => {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const result = await device.transferIn(endpoint.endpointNumber, 64);
        const dataView = result?.data as DataView | undefined;

        if (dataView) {
          const bytes = new Uint8Array(dataView.buffer);
          buffer.push(bytes);
        }
      }
    } catch (err) {
      console.error("USB MIDI read error", err);
    } finally {
      buffer.clear();
    }
  };

  readLoop();

  return {
    inputs: new Map([[input.id, input]]),
    onstatechange: null,
    cleanup: async () => {
      try {
        await device.releaseInterface(midiInterface.interfaceNumber);
      } catch (err) {
        console.warn("USB MIDI release issue", err);
      }

      try {
        await device.close();
      } catch (err) {
        console.warn("USB MIDI close issue", err);
      }
    },
  };
};

const resolveMidiProvider = (): {
  provider: MidiProvider | null;
  requestAccess?: () => Promise<SimplifiedMidiAccess | MIDIAccess>;
} => {
  if (typeof navigator === "undefined") {
    return { provider: null };
  }

  const nav = navigator as Navigator & {
    requestMIDIAccess?: () => Promise<SimplifiedMidiAccess | MIDIAccess>;
    serial?: any;
    usb?: any;
  };

  if (typeof nav.requestMIDIAccess === "function") {
    return { provider: "webmidi", requestAccess: nav.requestMIDIAccess.bind(nav) };
  }

  if (nav.serial?.requestPort) {
    return { provider: "serial", requestAccess: requestSerialMidiAccess };
  }

  if (nav.usb?.requestDevice) {
    return { provider: "usb", requestAccess: requestUsbMidiAccess };
  }

  return { provider: null };
};

export const useMidiInput = (options: UseMidiInputOptions = {}): MidiHookReturn => {
  const { enabled = false, onNoteOn, onNoteOff, onControlChange } = options;
  const { provider, requestAccess } = useMemo(resolveMidiProvider, []);
  const supported = Boolean(provider && requestAccess);

  const [midiAccess, setMidiAccess] = useState<
    SimplifiedMidiAccess | MIDIAccess | null
  >(null);
  const [status, setStatus] = useState<MidiStatus>(
    supported ? "idle" : "unsupported",
  );
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);

  const attachListenersRef = useRef<(() => void) | null>(null);
  const accessCleanupRef = useRef<(() => void | Promise<void>) | null>(null);

  const snapshotMidiAccess = (
    access: SimplifiedMidiAccess | MIDIAccess
  ): SimplifiedMidiAccess | MIDIAccess => {
    const midiInputs = (access as SimplifiedMidiAccess).inputs ?? new Map();
    return {
      ...(access as SimplifiedMidiAccess),
      inputs: midiInputs,
    };
  };

  const inputs = useMemo(() => {
    if (!midiAccess || !(midiAccess as SimplifiedMidiAccess).inputs) {
      return [] as MidiInput[];
    }

    const collection = (midiAccess as SimplifiedMidiAccess).inputs as any;

    if (collection && typeof collection.values === "function") {
      return Array.from(collection.values()) as MidiInput[];
    }

    if (collection && typeof collection[Symbol.iterator] === "function") {
      return Array.from(collection as Iterable<MidiInput>);
    }

    return [] as MidiInput[];
  }, [midiAccess]);

  useEffect(() => {
    if (!supported || !isEnabled) return;

    setStatus("pending");
    setPermissionError(null);

    const requestMidiAccess = requestAccess;

    if (!requestMidiAccess) {
      setStatus("unsupported");
      setPermissionError("No MIDI provider is available in this browser.");
      setIsEnabled(false);
      return;
    }

    try {
      const midiPromise = requestMidiAccess();

      if (!midiPromise || typeof (midiPromise as any).then !== "function") {
        setStatus("error");
        setPermissionError("The MIDI provider did not return a valid response.");
        setIsEnabled(false);
        return;
      }

      (midiPromise as Promise<SimplifiedMidiAccess | MIDIAccess>)
        .then((access) => {
          setMidiAccess(snapshotMidiAccess(access));
          setStatus("listening");

          const handleStateChange = () => {
            setMidiAccess(snapshotMidiAccess(access));
          };

          if (access.addEventListener) {
            access.addEventListener("statechange", handleStateChange);
            attachListenersRef.current = () =>
              access.removeEventListener?.("statechange", handleStateChange);
          } else {
            access.onstatechange = handleStateChange;
            attachListenersRef.current = () => {
              if (access.onstatechange === handleStateChange) {
                access.onstatechange = null;
              }
            };
          }

          accessCleanupRef.current = () => {
            attachListenersRef.current?.();
            (access as SimplifiedMidiAccess).cleanup?.();
          };
        })
        .catch((err) => {
          setStatus("error");
          setPermissionError(
            err?.message ?? "MIDI permission was blocked or unavailable."
          );
        });
    } catch (err: any) {
      setStatus("error");
      setPermissionError(
        err?.message ?? "MIDI could not be initialized in this browser."
      );
      setIsEnabled(false);
    }

    return () => {
      accessCleanupRef.current?.();
      setMidiAccess(null);
    };
  }, [isEnabled, requestAccess, supported]);

  useEffect(() => {
    if (!selectedInputId && inputs.length > 0) {
      setSelectedInputId(inputs[0].id);
    }
  }, [inputs, selectedInputId]);

  useEffect(() => {
    if (!midiAccess || !isEnabled) return;

    const targets = selectedInputId
      ? inputs.filter((input) => input.id === selectedInputId)
      : inputs;

    const handler = (event: MidiMessageEvent) =>
      normalizeMessage(event, { onNoteOn, onNoteOff, onControlChange });

    targets.forEach((input) => {
      if (input.addEventListener) {
        input.addEventListener("midimessage", handler);
      } else {
        input.onmidimessage = handler;
      }
    });

    return () => {
      targets.forEach((input) => {
        if (input.removeEventListener) {
          input.removeEventListener("midimessage", handler);
        } else if (input.onmidimessage === handler) {
          input.onmidimessage = null;
        }
      });
    };
  }, [inputs, onControlChange, onNoteOff, onNoteOn, isEnabled, midiAccess, selectedInputId]);

  return {
    supported,
    provider,
    status,
    permissionError,
    isEnabled,
    setIsEnabled,
    inputs,
    selectedInputId,
    setSelectedInputId,
  };
};

export default useMidiInput;
