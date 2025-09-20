import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  organizedBy: string;
  registrationLink?: string;
  onlineEventUrl?: string;
  userId: mongoose.Types.ObjectId;
  
  // Additional event information
  image?: string;
  maxAttendees?: number;
  currentAttendees: number;
  price?: number;
  isFree: boolean;
  
  // Event details
  eventType: 'workshop' | 'seminar' | 'networking' | 'pitch' | 'demo' | 'other';
  duration: number; // in minutes
  requirements?: string[];
  materials?: string[];
  
  // Registration
  registrationRequired: boolean;
  registrationDeadline?: Date;
  attendees: mongoose.Types.ObjectId[];
  
  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isActive: boolean;
  
  // Tags and keywords
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    trim: true,
  },
  organizedBy: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true,
  },
  registrationLink: String,
  onlineEventUrl: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Additional event information
  image: String,
  maxAttendees: {
    type: Number,
    min: 1,
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: 0,
  },
  price: {
    type: Number,
    min: 0,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  
  // Event details
  eventType: {
    type: String,
    enum: ['workshop', 'seminar', 'networking', 'pitch', 'demo', 'other'],
    required: [true, 'Event type is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Event duration is required'],
    min: 15, // minimum 15 minutes
  },
  requirements: [String],
  materials: [String],
  
  // Registration
  registrationRequired: {
    type: Boolean,
    default: true,
  },
  registrationDeadline: Date,
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Tags and keywords
  tags: [String],
}, {
  timestamps: true,
});

// Index for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ userId: 1 });
eventSchema.index({ tags: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.maxAttendees ? this.currentAttendees >= this.maxAttendees : false;
});

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.registrationRequired) return false;
  if (this.registrationDeadline) {
    return new Date() < this.registrationDeadline;
  }
  return this.date > new Date();
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
