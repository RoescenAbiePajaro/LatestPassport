import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import RichTextEditor from '../components/RichTextEditor';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: '', image: '' });
  const [publishError, setPublishError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const handleUploadImage = async () => {
    if (!file) {
      setImageUploadError('Please select an image');
      return;
    }
    setUploading(true);
    setImageUploadError(null);

    try {
      const fileName = `${uuidv4()}-${file.name}`;
      const imageUrl = await supabase.uploadFile(fileName, file);
      
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

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Create a post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <TextInput type='text' placeholder='Title' required value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        
        <Select onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
          <option value=''>Select a category</option>
          <option value='javascript'>JavaScript</option>
          <option value='reactjs'>React.js</option>
          <option value='nextjs'>Next.js</option>
        </Select>

        <FileInput type='file' accept='image/*' onChange={(e) => setFile(e.target.files[0])} />
        <Button type='button' gradientDuoTone='purpleToBlue' onClick={handleUploadImage} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        
        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        {formData.image && <img src={formData.image} alt='upload' className='w-full h-72 object-cover' />}

        <RichTextEditor onChange={(content) => setFormData({ ...formData, content })} />
        <Button gradientDuoTone='purpleToPink' className='w-full bg-purple-500 text-white' type='submit'>Publish</Button>
        {publishError && <Alert color='failure'>{publishError}</Alert>}
      </form>
    </div>
  );
}
