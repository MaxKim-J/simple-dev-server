import parcelWatcher, {
  type SubscribeCallback,
  type AsyncSubscription,
  type Event,
} from '@parcel/watcher';
import { Console } from './console';

const PROJECT_ROOT = process.env.PROJECT_CWD!;
const DEFAULT_IGNORE_PATTERN = ['**/dist/**', '!**/*.(ts|tsx)'];
const EVENT_LOG = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
};

/**
 * Watcher class to watch file changes
 */
export class Watcher {
  private watchEntry: string;
  private subscription: AsyncSubscription | null = null;

  constructor(watchEntry: string) {
    this.watchEntry = watchEntry;
  }

  public static getEventLog(events: Event[]) {
    return events.map((event) => {
      const eventPath = event.path.replace(PROJECT_ROOT, '');
      const eventType = EVENT_LOG[event.type];
      return `File Change Detected: ${eventPath} ${eventType}`;
    });
  }

  public async subscribe(
    callback: (
      eventLogs: string[],
      events: Event[],
      error: Error | null
    ) => void,
    options?: { ignore?: string[] }
  ) {
    const { ignore } = options ?? {};

    Console.log('watcher', [`Start watching these paths`]);

    const watchPaths = [this.watchEntry];
    Console.log(
      'watcher',
      watchPaths.map((path) => `- ${path}`),
      { indent: 2 }
    );

    this.subscription = await parcelWatcher.subscribe(
      this.watchEntry,
      (error, events) => {
        const eventLogs = Watcher.getEventLog(events);
        Console.log('watcher', eventLogs, { indent: 2 });
        callback(eventLogs, events, error);
      },
      { ignore: DEFAULT_IGNORE_PATTERN.concat(ignore ?? []) }
    );
  }

  public async unsubscribe() {
    if (!this.subscription) {
      throw Error('No subscription to unsubscribe from');
    }
    await this.subscription.unsubscribe();
  }
}
