export interface NotificationProps {
  id: string;
  userId: string;
  type: 'LEAGUE_INVITE' | 'BET_SETTLED' | 'LEAGUE_JOINED' | 'BET_WON' | 'BET_LOST';
  title: string;
  message: string;
  data?: any; // Dados extras específicos do tipo
  isRead: boolean;
  createdAt: Date;
}

export class Notification {
  private constructor(private props: NotificationProps) {}

  static create(props: Omit<NotificationProps, 'id' | 'isRead' | 'createdAt'>): Notification {
    return new Notification({
      ...props,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: NotificationProps): Notification {
    return new Notification(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): NotificationProps['type'] {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string {
    return this.props.message;
  }

  get data(): any {
    return this.props.data;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  markAsRead(): void {
    this.props.isRead = true;
  }

  toJSON(): NotificationProps {
    return { ...this.props };
  }
}