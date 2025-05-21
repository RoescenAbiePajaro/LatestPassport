import mongoose from 'mongoose';

const logoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default:
        'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png',
    },
    video: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    }
  },
  { timestamps: true }
);

const Logo = mongoose.model('Logo', logoSchema);

export default Logo;