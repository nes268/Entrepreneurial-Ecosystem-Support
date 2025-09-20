import mongoose, { Document, Schema } from 'mongoose';

export interface IMentor extends Document {
  name: string;
  role: string;
  email: string;
  experience: string;
  bio: string;
  profilePicture: string;
  rating: number;
  userId?: mongoose.Types.ObjectId;
  
  // Additional mentor information
  phoneNumber?: string;
  linkedinProfile?: string;
  website?: string;
  location?: string;
  
  // Expertise areas
  expertise: string[];
  sectors: string[];
  
  // Availability
  availability: {
    days: string[];
    timeSlots: {
      start: string;
      end: string;
    }[];
    timezone: string;
  };
  
  // Mentoring preferences
  preferences: {
    maxMentees: number;
    preferredSectors: string[];
    preferredStages: string[];
    meetingFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  };
  
  // Current mentees
  currentMentees: mongoose.Types.ObjectId[];
  
  // Statistics
  stats: {
    totalMentees: number;
    averageRating: number;
    totalSessions: number;
    yearsOfExperience: number;
  };
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const mentorSchema = new Schema<IMentor>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    trim: true,
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Additional mentor information
  phoneNumber: String,
  linkedinProfile: String,
  website: String,
  location: String,
  
  // Expertise areas
  expertise: [{
    type: String,
    trim: true,
  }],
  sectors: [{
    type: String,
    trim: true,
  }],
  
  // Availability
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    }],
    timeSlots: [{
      start: String,
      end: String,
    }],
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  
  // Mentoring preferences
  preferences: {
    maxMentees: {
      type: Number,
      default: 5,
      min: 1,
      max: 20,
    },
    preferredSectors: [String],
    preferredStages: [String],
    meetingFrequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly'],
      default: 'monthly',
    },
  },
  
  // Current mentees
  currentMentees: [{
    type: Schema.Types.ObjectId,
    ref: 'Startup',
  }],
  
  // Statistics
  stats: {
    totalMentees: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for better query performance
mentorSchema.index({ email: 1 });
mentorSchema.index({ isActive: 1 });
mentorSchema.index({ isVerified: 1 });
mentorSchema.index({ sectors: 1 });
mentorSchema.index({ expertise: 1 });
mentorSchema.index({ rating: -1 });

export const Mentor = mongoose.model<IMentor>('Mentor', mentorSchema);
