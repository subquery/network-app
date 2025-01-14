import { ChatBoxRef } from '@subql/components';
import { create } from 'zustand';

export type chatBoxStore = {
  chatBoxRef?: ChatBoxRef;
  setChatBoxRef: (ref: ChatBoxRef) => void;
};

export const useChatBoxStore = create<chatBoxStore>((set) => ({
  chatBoxRef: undefined,
  setChatBoxRef(ref) {
    this.chatBoxRef = ref;
  },
}));
