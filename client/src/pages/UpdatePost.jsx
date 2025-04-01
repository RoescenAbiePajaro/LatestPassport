import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RichTextEditor from '../components/RichTextEditor';
import supabase, { CDNURL } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

export default function UpdatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: '', content: '', image: '' });
  const [publishError, setPublishError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if (!res.ok) {
          setPublishError(data.message);
          return;
        }
        setFormData(data.posts[0]);
      } catch (error) {
        setPublishError('Failed to fetch post data');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleUploadImage = async () => {
    if (!file) {
      setImageUploadError('Please select an image');
      return;
    }

    setUploading(true);
    setImageUploadError(null);

    try {
      const fileName = `${uuidv4()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('passportinteractiveboard')
        .upload(fileName, file);

      if (error) {
        throw new Error(error.message);
      }

      const imageUrl = `${CDNURL}${fileName}`;
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
      setImageUploadError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Update post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <TextInput
          type='text'
          placeholder='Title'
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Select onChange={(e) => setFormData({ ...formData, category: e.target.value })} value={formData.category}>
          <option value=''>Select a category</option>
          <option value='/appointment'>Appointment</option>
          <option value='/passport'>Passport</option>
          <option value='/renewal'>Renewal</option>
          <option value='/tracking'>Tracking</option>
          <option value='/visa'>Visa</option>
        </Select>

        <FileInput type='file' accept='image/*' onChange={(e) => setFile(e.target.files[0])} />
        <Button
          gradientDuoTone='purpleToPink'
          className='w-full bg-blue-500 text-white'
          type='button'
          onClick={handleUploadImage}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>

        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        {formData.image && <img src={formData.image} alt='upload' className='w-full h-72 object-cover' />}

        <RichTextEditor onChange={(content) => setFormData({ ...formData, content })} value={formData.content} />
        
        <Button gradientDuoTone='purpleToPink' className='w-full bg-blue-500 text-white' type='submit'>
          Update post
        </Button>
        {publishError && <Alert color='failure'>{publishError}</Alert>}
      </form>
    </div>
  );
}