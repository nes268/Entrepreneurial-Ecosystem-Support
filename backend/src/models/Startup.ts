import mongoose, { Document, Schema } from 'mongoose';

export type TRLLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface IStartup extends Document {
  name: string;
  founder: string;
  sector: string;
  type: 'innovation' | 'incubation';
  status: 'pending' | 'active' | 'completed' | 'dropout';
  trlLevel: TRLLevel;
  email: string;
  submissionDate: Date;
  userId: mongoose.Types.ObjectId;
  profileId?: mongoose.Types.ObjectId;
  
  // Additional startup information
  description?: string;
  website?: string;
  linkedinProfile?: string;
  teamSize?: number;
  foundedYear?: number;
  location?: string;
  
  // Application details
  applicationStatus: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  assignedMentor?: mongoose.Types.ObjectId;
  assignedInvestor?: mongoose.Types.ObjectId;
  
  // Progress tracking
  milestones?: {
    name: string;
    description: string;
    targetDate: Date;
    completedDate?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  }[];
  
  // Funding information
  fundingHistory?: {
    amount: number;
    source: string;
    date: Date;
    stage: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

const startupSchema = new Schema<IStartup>({
  name: {
    type: String,
    required: [true, 'Startup name is required'],
    trim: true,
  },
  founder: {
    type: String,
    required: [true, 'Founder name is required'],
    trim: true,
  },
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['innovation', 'incubation'],
    required: [true, 'Type is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'dropout'],
    default: 'pending',
  },
  trlLevel: {
    type: Number,
    required: [true, 'TRL level is required'],
    min: 1,
    max: 9,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
  },
  
  // Additional startup information
  description: String,
  website: String,
  linkedinProfile: String,
  teamSize: {
    type: Number,
    min: 1,
  },
  foundedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
  },
  location: String,
  
  // Application details
  applicationStatus: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'draft',
  },
  reviewNotes: String,
  assignedMentor: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor',
  },
  assignedInvestor: {
    type: Schema.Types.ObjectId,
    ref: 'Investor',
  },
  
  // Progress tracking
  milestones: [{
    name: {
      type: String,
      required: true,
    },
    description: String,
    targetDate: {
      type: Date,
      required: true,
    },
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'overdue'],
      default: 'pending',
    },
  }],
  
  // Funding information
  fundingHistory: [{
    amount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    stage: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

// Index for better query performance
startupSchema.index({ userId: 1 });
startupSchema.index({ status: 1 });
startupSchema.index({ type: 1 });
startupSchema.index({ sector: 1 });
startupSchema.index({ applicationStatus: 1 });
startupSchema.index({ trlLevel: 1 });
startupSchema.index({ assignedMentor: 1 });
startupSchema.index({ assignedInvestor: 1 });

export const Startup = mongoose.model<IStartup>('Startup', startupSchema);
