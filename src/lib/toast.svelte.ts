class ToastState {
  current = $state<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);
  private timer: any = null;

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (typeof window !== 'undefined') {
      clearTimeout(this.timer);
      this.current = { message, type, id: Date.now() };
      this.timer = setTimeout(() => {
        this.current = null;
      }, 3500);
    }
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }
}

export const toast = new ToastState();
