import { Alert, Button, Modal, ModalBody, TextInput, Label } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const validateForm = () => {
    const errors = {};
    if (formData.username && formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageFileUploadError('File size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setImageFileUploadError('File must be an image');
        return;
      }
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
      setImageFileUploadError(null);
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          'Could not upload image (File must be less than 2MB)'
        );
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear validation error when user starts typing
    if (validationErrors[e.target.id]) {
      setValidationErrors({ ...validationErrors, [e.target.id]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made');
      setTimeout(() => {
        setUpdateUserError(null);
      }, 3000);
      return;
    }

    if (imageFileUploading) {
      setUpdateUserError('Please wait for image to upload');
      setTimeout(() => {
        setUpdateUserError(null);
      }, 3000);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl dark:text-white'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className='relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full hover:opacity-80 transition-opacity'
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
                text: {
                  fill: '#fff',
                  fontSize: '16px',
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt='user'
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] dark:border-gray-600 ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              'opacity-60'
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color='failure' className='mt-2'>{imageFileUploadError}</Alert>
        )}
        
        <div>
          <Label htmlFor='username' className='dark:text-white'>Username</Label>
          <TextInput
            type='text'
            id='username'
            placeholder='username'
            defaultValue={currentUser.username}
            onChange={handleChange}
            color={validationErrors.username ? 'failure' : 'gray'}
            helperText={validationErrors.username}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='email' className='dark:text-white'>Email</Label>
          <TextInput
            type='email'
            id='email'
            placeholder='email'
            defaultValue={currentUser.email}
            onChange={handleChange}
            color={validationErrors.email ? 'failure' : 'gray'}
            helperText={validationErrors.email}
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='password' className='dark:text-white'>New Password (optional)</Label>
          <TextInput
            type='password'
            id='password'
            placeholder='password'
            onChange={handleChange}
            color={validationErrors.password ? 'failure' : 'gray'}
            helperText={validationErrors.password}
            className='mt-1'
          />
        </div>

        <Button
          type='submit'
          gradientDuoTone='purpleToBlue'
          outline
          disabled={loading || imageFileUploading}
          className='mt-4'
        >
          {loading ? 'Loading...' : 'Update Profile'}
        </Button>

        {currentUser.isAdmin && (
          <Link to={'/create-post'}>
            <Button
              type='button'
              gradientDuoTone='purpleToPink'
              className='w-full mt-2'
            >
              Create a post
            </Button>
          </Link>
        )}
      </form>

      <div className='flex justify-between mt-5'>
        <Button
          color='failure'
          outline
          onClick={() => setShowModal(true)}
          className='hover:bg-red-100 dark:hover:bg-red-900'
        >
          Delete Account
        </Button>
        <Button
          color='gray'
          outline
          onClick={handleSignout}
          className='hover:bg-gray-100 dark:hover:bg-gray-700'
        >
          Sign Out
        </Button>
      </div>

      {updateUserError && (
        <Alert color='failure' className='mt-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role="alert">
          {updateUserError}
        </Alert>
      )}
      {updateUserSuccess && (
        <Alert color='success' className='mt-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative' role="alert">
          {updateUserSuccess}
        </Alert>
      )}
      {error && (
        <Alert color='failure' className='mt-5'>
          {error}
        </Alert>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='xs'
        position="center"
        dismissible={false}
        className="dark:bg-gray-800 max-w-[360px] mx-auto"
      >
        <div className="relative">
          <Modal.Header className="dark:border-gray-600 px-3 pt-3" />
          <Modal.Body className="px-4 pb-4">
            <div className='text-center'>
              <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
              <h3 className='mb-5 text-base font-semibold text-gray-600 dark:text-gray-300'>
                Are you sure you want to delete your account?
              </h3>
              <div className='flex justify-center items-center gap-3'>
                <Button 
                  color='failure' 
                  onClick={handleDeleteUser}
                  size="sm"
                  className='bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 w-24 font-medium'
                >
                  Delete
                </Button>
                <Button 
                  color='gray' 
                  onClick={() => setShowModal(false)}
                  size="sm"
                  className='dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 w-24 font-medium'
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </div>
  );
}