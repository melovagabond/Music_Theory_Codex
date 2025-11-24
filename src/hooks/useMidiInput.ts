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

type MidiHookReturn = {
  supported: boolean;
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

export const useMidiInput = (options: UseMidiInputOptions = {}): MidiHookReturn => {
  const { enabled = false, onNoteOn, onNoteOff, onControlChange } = options;
  const supported =
    typeof navigator !== "undefined" &&
    typeof (navigator as Navigator & {
      requestMIDIAccess?: () => Promise<SimplifiedMidiAccess | MIDIAccess>;
    }).requestMIDIAccess === "function";

  const [midiAccess, setMidiAccess] = useState<
    SimplifiedMidiAccess | MIDIAccess | null
  >(null);
  const [status, setStatus] = useState<MidiStatus>(supported ? "idle" : "unsupported");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);

  const attachListenersRef = useRef<(() => void) | null>(null);

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

    return Array.from(collection || []) as MidiInput[];
  }, [midiAccess]);

  useEffect(() => {
    if (!supported || !isEnabled) return;

    setStatus("pending");
    setPermissionError(null);

    (navigator as Navigator & {
      requestMIDIAccess?: () => Promise<SimplifiedMidiAccess | MIDIAccess>;
    })
      .requestMIDIAccess?.()
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
      })
      .catch((err) => {
        setStatus("error");
        setPermissionError(
          err?.message ?? "MIDI permission was blocked or unavailable."
        );
      });

    return () => {
      attachListenersRef.current?.();
      setMidiAccess(null);
    };
  }, [isEnabled, supported]);

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
