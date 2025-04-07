import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase, { CDNURL } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import RichTextEditor from '../components/RichTextEditor';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'uncategorized', image: '' });
  const [publishError, setPublishError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setPublishError('Title and content are required');
      return;
    }
    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch {
      setPublishError('Something went wrong');
    }
  };

  const handleUploadImage = async () => {
    if (!file) {
      setImageUploadError('Please select an image');
      return;
    }

    setUploading(true);
    setImageUploadError(null);

    try {
      const fileName = `${uuidv4()}-${file.name}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('passportinteractiveboard')
        .upload(fileName, file);

      if (error) {
        throw new Error(error.message);
      }

      // Construct public URL manually
      const imageUrl = `${CDNURL}${fileName}`;
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
      setImageUploadError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Create a post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <TextInput
          type='text'
          placeholder='Title'
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Select 
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value='uncategorized'>Select a category</option>
          <option value='appointment'>Appointment</option>
          <option value='passport'>Passport</option>
          <option value='renewal'>Renewal</option>
          <option value='tracking'>Tracking</option>
          <option value='visa'>Visa</option>
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

        <RichTextEditor onChange={(content) => setFormData({ ...formData, content })} />
        <Button gradientDuoTone='purpleToPink' className='w-full bg-blue-500 text-white' type='submit'>
          Publish
        </Button>
        {publishError && <Alert color='failure'>{publishError}</Alert>}
      </form>
    </div>
  );
}