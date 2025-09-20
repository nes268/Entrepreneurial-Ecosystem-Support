import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  name: string;
  type: string;
  dateGenerated: Date;
  fileSize: string;
  status: 'ready' | 'processing' | 'error';
  userId: mongoose.Types.ObjectId;
  
  // Additional report information
  description?: string;
  parameters: {
    [key: string]: any;
  };
  
  // File information
  filePath?: string;
  fileName?: string;
  mimeType?: string;
  
  // Report configuration
  reportConfig: {
    format: 'pdf' | 'excel' | 'csv' | 'json';
    template?: string;
    filters?: {
      [key: string]: any;
    };
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  
  // Processing information
  processingInfo: {
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string;
    retryCount: number;
  };
  
  // Access control
  isPublic: boolean;
  allowedUsers: mongoose.Types.ObjectId[];
  
  // Tags and keywords
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  name: {
    type: String,
    required: [true, 'Report name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Report type is required'],
    trim: true,
  },
  dateGenerated: {
    type: Date,
    default: Date.now,
  },
  fileSize: {
    type: String,
    default: '0 B',
  },
  status: {
    type: String,
    enum: ['ready', 'processing', 'error'],
    default: 'processing',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Additional report information
  description: String,
  parameters: {
    type: Schema.Types.Mixed,
    default: {},
  },
  
  // File information
  filePath: String,
  fileName: String,
  mimeType: String,
  
  // Report configuration
  reportConfig: {
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv', 'json'],
      default: 'pdf',
    },
    template: String,
    filters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    dateRange: {
      start: Date,
      end: Date,
    },
  },
  
  // Processing information
  processingInfo: {
    startedAt: Date,
    completedAt: Date,
    errorMessage: String,
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  
  // Access control
  isPublic: {
    type: Boolean,
    default: false,
  },
  allowedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Tags and keywords
  tags: [String],
}, {
  timestamps: true,
});

// Index for better query performance
reportSchema.index({ userId: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ dateGenerated: -1 });
reportSchema.index({ isPublic: 1 });
reportSchema.index({ tags: 1 });

// Virtual for processing duration
reportSchema.virtual('processingDuration').get(function() {
  if (this.processingInfo.startedAt && this.processingInfo.completedAt) {
    return this.processingInfo.completedAt.getTime() - this.processingInfo.startedAt.getTime();
  }
  return null;
});

// Virtual for file size in bytes
reportSchema.virtual('fileSizeBytes').get(function() {
  const size = this.fileSize;
  const units = ['B', 'KB', 'MB', 'GB'];
  const sizes = size.match(/(\d+\.?\d*)\s*([A-Z]+)/i);
  
  if (!sizes) return 0;
  
  const value = parseFloat(sizes[1]);
  const unit = sizes[2].toUpperCase();
  const unitIndex = units.indexOf(unit);
  
  if (unitIndex === -1) return 0;
  
  return Math.round(value * Math.pow(1024, unitIndex));
});

// Ensure virtual fields are serialized
reportSchema.set('toJSON', { virtuals: true });

export const Report = mongoose.model<IReport>('Report', reportSchema);
