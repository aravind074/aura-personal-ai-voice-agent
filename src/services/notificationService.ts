/**
 * Notification Service for AURA Personal AI
 * Delivers system notifications, audio chimes, and voice alerts to Computer & Phone
 */

import { Reminder } from '../types/index.js';
import { api } from './apiClient.js';
import { audioService } from './audioService.js';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export class NotificationService {
  private permission: NotificationPermissionState = 'default';
  private localCheckIntervalId: number | null = null;
  private focusSyncHandler: (() => void) | null = null;
  private notifiedReminderIds: Set<string> = new Set();
  private onReminderTriggeredCallback: ((reminder: Reminder) => void) | null = null;

  constructor() {
    this.updatePermissionState();
  }

  updatePermissionState(): NotificationPermissionState {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.permission = 'unsupported';
      return 'unsupported';
    }
    this.permission = Notification.permission as NotificationPermissionState;
    return this.permission;
  }

  getPermissionState(): NotificationPermissionState {
    return this.updatePermissionState();
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission as NotificationPermissionState;

      if (permission === 'granted') {
        this.sendSystemNotification(
          '🔔 AURA Notifications Enabled',
          'You will now receive timely reminders and proactive alerts on your computer and phone.',
          { tag: 'aura-welcome' }
        );
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[NotificationService] Error requesting notification permissions:', err);
      return false;
    }
  }

  // Send desktop / mobile phone notification
  async sendSystemNotification(
    title: string,
    body: string,
    options?: { tag?: string; icon?: string; badge?: string; requireInteraction?: boolean; data?: any }
  ): Promise<boolean> {
    this.updatePermissionState();

    if (this.permission !== 'granted') {
      return false;
    }

    try {
      // 1. Try via ServiceWorkerRegistration (Best for Mobile Phone PWAs & Background notifications)
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && registration.showNotification) {
            await registration.showNotification(title, {
              body,
              icon: options?.icon || '/favicon.ico',
              badge: options?.badge || '/favicon.ico',
              tag: options?.tag || `aura-alert-${Date.now()}`,
              data: options?.data,
              requireInteraction: options?.requireInteraction ?? true,
              // Vibration pattern for mobile phones (buzz, pause, buzz)
              vibrate: [200, 100, 200, 100, 200] as any,
            } as any);
            return true;
          }
        } catch {
          // SW fallback to standard notification
        }
      }

      // 2. Standard Web Notification API fallback (Desktop / Computer browsers)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const notif = new Notification(title, {
          body,
          icon: options?.icon || '/favicon.ico',
          tag: options?.tag || `aura-alert-${Date.now()}`,
          requireInteraction: options?.requireInteraction ?? true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      }
    } catch (err) {
      console.warn('[NotificationService] Failed to send notification:', err);
    }
    return false;
  }

  // Set callback when a reminder is triggered in real-time
  setOnReminderTriggered(callback: (reminder: Reminder) => void) {
    this.onReminderTriggeredCallback = callback;
  }

  // Start background monitoring of reminders using in-memory list + event-driven tab focus syncing
  startReminderWatcher(
    getReminders: () => Reminder[],
    onUpdateReminders: (reminders: Reminder[]) => void,
    fetchLatestReminders?: () => Promise<void>
  ) {
    this.stopReminderWatcher();

    // 1. Fast, zero-network in-memory check every 1.5 seconds for instant alerts
    const checkInMemory = async () => {
      try {
        const now = new Date();
        const reminders = getReminders();
        let hasUpdates = false;
        const updatedList: Reminder[] = [];

        for (const rem of reminders) {
          if (!rem.completed && !rem.triggered && rem.datetime) {
            const remTime = new Date(rem.datetime);
            // If due now or overdue
            if (remTime.getTime() <= now.getTime()) {
              if (!this.notifiedReminderIds.has(rem.id)) {
                this.notifiedReminderIds.add(rem.id);
                this.triggerReminderAlert(rem);
                rem.triggered = true;
                hasUpdates = true;

                // Sync to backend asynchronously
                api.updateReminder(rem.id, { triggered: true }).catch(() => {});
              }
            }
          }
          updatedList.push(rem);
        }

        if (hasUpdates) {
          onUpdateReminders(updatedList);
        }
      } catch {
        // Safe silent check
      }
    };

    // Run initial check
    checkInMemory();
    this.localCheckIntervalId = window.setInterval(checkInMemory, 1500);

    // 2. Event-driven sync on window focus / tab activation (zero constant polling)
    if (fetchLatestReminders && typeof window !== 'undefined') {
      this.focusSyncHandler = () => {
        if (typeof document !== 'undefined' && !document.hidden) {
          fetchLatestReminders().catch(() => {});
        }
      };

      window.addEventListener('focus', this.focusSyncHandler);
      document.addEventListener('visibilitychange', this.focusSyncHandler);
    }
  }

  stopReminderWatcher() {
    if (this.localCheckIntervalId) {
      clearInterval(this.localCheckIntervalId);
      this.localCheckIntervalId = null;
    }
    if (this.focusSyncHandler && typeof window !== 'undefined') {
      window.removeEventListener('focus', this.focusSyncHandler);
      document.removeEventListener('visibilitychange', this.focusSyncHandler);
      this.focusSyncHandler = null;
    }
  }

  // Full multi-modal reminder alert: OS notification + Audio Chime + Spoken Alert + UI Callback
  triggerReminderAlert(reminder: Reminder) {
    const timeFormatted = new Date(reminder.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const title = `⏰ Reminder: ${reminder.title}`;
    const body = `Scheduled for ${timeFormatted}${reminder.notes ? ` • ${reminder.notes}` : ''}`;

    // 1. Send native OS Push / Desktop Notification to phone/computer
    this.sendSystemNotification(title, body, {
      tag: `reminder-${reminder.id}`,
      requireInteraction: true,
      data: { reminderId: reminder.id },
    });

    // 2. Play distinct multi-tone alert chime
    audioService.playChime('success');

    // 3. UI In-app toast banner
    if (this.onReminderTriggeredCallback) {
      this.onReminderTriggeredCallback(reminder);
    }
  }
}

export const notificationService = new NotificationService();
