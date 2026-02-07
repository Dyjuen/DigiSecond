
type ChatVisibilityHandler = (isOpen: boolean) => void;

class UIEventManager {
    private static listeners: Set<ChatVisibilityHandler> = new Set();
    private static isChatOpenState = false;

    static subscribe(handler: ChatVisibilityHandler) {
        this.listeners.add(handler);
        // Immediately notify current state
        handler(this.isChatOpenState);
        return () => this.listeners.delete(handler);
    }

    static setChatOpen(isOpen: boolean) {
        if (this.isChatOpenState === isOpen) return;
        this.isChatOpenState = isOpen;
        this.listeners.forEach(handler => handler(isOpen));
    }

    static isChatOpen() {
        return this.isChatOpenState;
    }
}

export const uiEvents = UIEventManager;
