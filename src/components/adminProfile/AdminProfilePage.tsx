import userApi from '@apis/user/userApi';
import { svgCopyMini, svgPinTalkEmoPlaceBig, svgPinTalkEmoPlaceSmall } from '@styles/svg';
import { userData } from 'types/userState';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserImage, UserProfile } from '@apis/user/userApi.type';
import { useRouter } from 'next/router';
import { unsetAuthorHeader } from '@apis/_axios/instance';
import { useFetchUserId } from '@hooks/useFetchUserId';
import authApi from '@apis/auth/authApi';
import DeleteAccountPopup from './DeleteAccountPopup';
import { ChangePasswordPopup } from './ChangePasswordPopup';
import { AuthChangePw, AuthPassword } from '@apis/auth/authApi.type';

const AdminProfilePage = () => {
  const [userData, setUserData] = useState<userData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const id = useFetchUserId();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      profileName: '',
      description: '',
      serviceName: '',
      serviceDomain: '',
      serviceExpl: '',
    },
  });
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userApi.getUserDataById({ id });
        setUserData(data);
      } catch (e) {
        router.push('/404');
        localStorage.removeItem('access_token');
        unsetAuthorHeader();
      }
    };
    if (id && id !== 0) {
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (userData) {
      setValue('profileName', userData.profileName);
      setValue('description', userData.description);
      setValue('serviceName', userData.serviceName);
      setValue('serviceDomain', userData.serviceDomain);
      setValue('serviceExpl', userData.serviceExpl);
    }
  }, [userData, setValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const userImage: UserImage = {
        profileImage: file,
      };
      try {
        const updatedData = await userApi.patchUserImageById({ id }, userImage);
        setUserData(updatedData);
        console.log(userData);
      } catch (error) {
        console.error('Error updating the user image:', error);
      }
    }
  };

  const uploadedImage = userData?.profileImage;

  const handleEditButtonClick = () => {
    setIsEditing(true);
  };

  const onSubmit = async (data: UserProfile) => {
    setIsEditing(false);
    const updatedData = await userApi.patchUserDataById({ id }, data);
    setUserData(updatedData);
  };

  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  const openDeletePopup = () => {
    setIsDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    setIsDeletePopupOpen(false);
  };

  const [passwordCorrect, setPasswordCorrect] = useState(true);
  const handleDeleteAccount = async (data: AuthPassword) => {
    try {
      setPasswordCorrect(true);
      await authApi.postLeave(data);
      closeDeletePopup();
      router.push('/main');
    } catch (e) {
      setPasswordCorrect(false);
    }
  };

  const [isChangePasswordPopupOpen, setIsChangePasswordPopupOpen] = useState(false);

  const openChangePasswordPopup = () => {
    setIsChangePasswordPopupOpen(true);
  };

  const closeChangePasswordPopup = () => {
    setIsChangePasswordPopupOpen(false);
  };

  const [passwordValid, setPasswordValid] = useState(true);
  const handlePasswordChange = async (data: AuthChangePw) => {
    try {
      setPasswordValid(true);
      await authApi.postChangePassword(data);
      closeChangePasswordPopup();
    } catch (error) {
      setPasswordValid(false);
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    const textarea = document.createElement('textarea');
    if (text) textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-col md-min:justify-center items-center h-screen pb-10 md-min:min-w-[930px] bg-BG-2 md:min-h-[950px]'>
        <div className='flex justify-between w-10/12 md:w-11/12 md:max-w-[400px] mt-5 items-center'>
          <div className='font-PretendardMedium text-18 text-blue-main'>프로필 정보</div>
          {!isEditing ? (
            <div
              className='bg-BG-1 cursor-pointer text-text-4 font-PretendardMedium text-14 border-[0.5px] border-border rounded-[10px] py-2 px-4 mb-4'
              onClick={handleEditButtonClick}>
              수정하기
            </div>
          ) : (
            <button
              type='submit'
              className='bg-blue-sub text-blue-main font-PretendardMedium text-14 border-[0.5px] border-blue-main rounded-[10px] py-2 px-4 mb-4'>
              저장하기
            </button>
          )}
        </div>
        <div className='w-10/12 md:w-11/12 md:max-w-[400px] xl-min:h-[35%] md-min:min-h-[250px] bg-white rounded-lg shadow-custom2 mb-8 flex items-center justify-center xl-min:min-h-[300px] border-blue-sub border-2'>
          <div className='w-10/12 md-min:h-4/5 flex md:flex-col md:py-6'>
            <div className='w-3/12 flex flex-col justify-center items-center xl:mr-2 md:hidden'>
              <div className='rounded-full w-[173px] h-[173px] xl:w-[132px] xl:h-[132px] mb-5 overflow-hidden flex justify-center items-center'>
                {uploadedImage ? (
                  <img
                    src={`${uploadedImage}`}
                    alt='profileImage'
                    className='object-cover w-full h-full'
                  />
                ) : (
                  <div>
                    <div className='xl:hidden'>{svgPinTalkEmoPlaceBig}</div>
                    <div className='xl-min:hidden'>{svgPinTalkEmoPlaceSmall}</div>
                  </div>
                )}
              </div>
              <input
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
                id='upload-photo1'
              />
              <label htmlFor='upload-photo' className='cursor-pointer'>
                <div className='bg-BG-1 text-text-4 font-PretendardMedium text-13 border-[0.5px] border-border rounded-[10px] py-2 px-3'>
                  사진 변경하기
                </div>
              </label>
            </div>
            <div className='md-min:w-[30%] md-min:h-[70%] md:h-[150px] flex my-auto flex-col justify-between md-min:ml-10'>
              <div className='flex justify-between h-full'>
                <div className='h-full md-min:w-[90%] min-w-[220px] xl:min-w-[190px] md:w-[130px]'>
                  <div className='xl-min:min-h-[50%] md-min:min-h-[55%] md:h-[65px]'>
                    <div className='mb-1 font-PretendardMedium xl:text-14 text-16 text-blue-main md:mt-2'>
                      프로필 이름
                    </div>
                    {isEditing ? (
                      <input
                        {...register('profileName', { required: isEditing })}
                        placeholder='프로필 이름을 입력해주세요'
                        className='border-border border w-full rounded-[10px] h-[40px] p-3 md:h-[30px] xl:text-12 text-14 placeholder:text-text-5'
                      />
                    ) : (
                      <div className='text-16 xl:text-15 md:text-14 text-text-4 mt-2 bg-BG-2 rounded-[10px] h-[40px] md:h-[30px] flex items-center px-3'>
                        {userData?.profileName}
                      </div>
                    )}
                  </div>
                  <div className='md-min:min-h-[60%] md:h-[70px]'>
                    <div className='mb-1 font-PretendardMedium xl:text-14 text-16 text-blue-main'>
                      이메일
                    </div>
                    <div className='text-16 xl:text-15 md:text-14 text-text-4 mt-2 bg-BG-2 rounded-[10px] h-[40px] md:h-[30px] flex items-center px-3'>
                      {userData?.email}
                    </div>
                  </div>
                </div>
                <div className='flex flex-col justify-center items-center md-min:hidden'>
                  <div className='rounded-full w-[100px] h-[100px] mb-5 md:mb-3 overflow-hidden flex justify-center items-center'>
                    {uploadedImage ? (
                      <img
                        src={`${uploadedImage}`}
                        alt='profileImage'
                        className='object-cover w-full h-full'
                      />
                    ) : (
                      <div>
                        <div className='xl:hidden'>{svgPinTalkEmoPlaceBig}</div>
                        <div className='xl-min:hidden'>{svgPinTalkEmoPlaceSmall}</div>
                      </div>
                    )}
                  </div>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='hidden'
                    id='upload-photo2'
                  />
                  <label htmlFor='upload-photo' className='cursor-pointer'>
                    <div className='bg-BG-1 text-text-4 font-PretendardMedium text-12 border-[0.5px] border-border rounded-[10px] py-2 px-3'>
                      사진 변경하기
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className='w-5/12 md:w-full h-[70%] md:h-[100px] flex my-auto flex-col justify-center md:ml-0 xl:ml-6 ml-8'>
              <div className='mb-1 font-PretendardMedium xl:text-14  text-16 text-blue-main'>
                상태 메세지
              </div>
              {isEditing ? (
                <textarea
                  {...register('description', { required: isEditing })}
                  placeholder='상태 메세지를 입력해주세요'
                  className='border-border border rounded-[10px] h-full p-3 xl:text-12 text-14 placeholder:text-text-5 resize-none'
                />
              ) : (
                <textarea
                  className='h-full text-16 xl:text-15 md:text-14 text-text-4 rounded-[10px] bg-BG-2 p-3 resize-none'
                  value={userData?.description}
                />
              )}
            </div>
          </div>
        </div>
        <div className='flex md:flex-col w-10/12 md:w-11/12 md:max-w-[400px] md-min:h-[280px] xl-min:h-2/5 xl-min:min-h-[320px]'>
          <div className='flex flex-col md-min:w-1/2 md-min:mr-8 md:mb-8 h-full'>
            <div className='font-PretendardMedium text-18 text-blue-main mb-3'>서비스 정보</div>
            <div className='bg-white rounded-lg shadow-custom2 py-2 flex flex-col h-full border-blue-sub border-2'>
              <div className='w-full font-PretendardMedium xl:text-14 md:px-7 xl:px-8 px-10 pt-1 pb-4 text-16 text-text-1 h-full'>
                <div className={`flex my-3 items-center ${isEditing ? 'justify-between' : ''}`}>
                  <div className='w-[110px] xl:w-[90px]'>서비스 이름</div>
                  {isEditing ? (
                    <input
                      {...register('serviceName', { required: isEditing })}
                      placeholder='서비스 이름을 입력해주세요'
                      className='border-border border rounded-[10px] xl:h-[30px] h-[40px] md:w-9/12 xl:w-8/12 w-9/12 xl:p-2 p-3 xl:text-12  text-14 placeholder:text-text-5'
                    />
                  ) : (
                    <div className='text-16 xl:text-15 md:text-14 text-text-4 xl:h-[30px] h-[40px] flex items-center'>
                      {userData?.serviceName}
                    </div>
                  )}
                </div>
                <div className={`flex my-3 items-center ${isEditing ? 'justify-between' : ''}`}>
                  <div className='w-[110px] xl:w-[90px]'>서비스 도메인</div>
                  {isEditing ? (
                    <input
                      {...register('serviceDomain', { required: isEditing })}
                      placeholder='서비스 도메인 주소를 입력해주세요'
                      className='border-border border rounded-[10px] xl:h-[30px] h-[40px] md:w-9/12 xl:w-8/12 w-9/12 xl:p-2 p-3 xl:text-12 text-14 placeholder:text-text-5'
                    />
                  ) : (
                    <div className='text-16 xl:text-15 md:text-14 text-text-4 xl:h-[30px] h-[40px] flex items-center'>
                      {userData?.serviceDomain}
                    </div>
                  )}
                </div>
                <div className={`flex mt-3 h-3/5 ${isEditing ? 'justify-between' : ''}`}>
                  <div className='w-[110px] xl:w-[90px]'>서비스 소개</div>
                  {isEditing ? (
                    <textarea
                      {...register('serviceExpl', { required: isEditing })}
                      placeholder='서비스 소개를 입력해주세요'
                      className='border-border border rounded-[10px] min-h-[90px] h-full md:w-9/12 xl:w-8/12 w-9/12 xl:px-2 px-3 xl:py-1 py-2 xl:text-12 text-14 placeholder:text-text-5 resize-none'
                    />
                  ) : (
                    <textarea
                      readOnly={!isEditing}
                      className='text-16 xl:text-15 md:text-14 text-text-4 min-h-[90px] h-full xl:w-8/12 w-[65%] resize-none'
                      value={userData?.serviceExpl}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='md-min:w-1/2'>
            <div>
              <div className='font-PretendardMedium text-18 text-blue-main mb-3'>Key 정보</div>
              <div className='h-[150px] xl:h-[125px] bg-white rounded-lg shadow-custom2 py-4 flex flex-col border-blue-sub border-2 justify-center'>
                <div className='font-PretendardMedium xl:text-14 xl:px-8 px-10 text-16 text-text-1'>
                  <div className='flex items-center'>
                    <div className='xl:w-[100px] w-[120px]'>Access Key</div>
                    <div className='xl:mr-6 mr-12 w-1/2 overflow-auto whitespace-nowrap'>
                      {userData?.accessKey}
                    </div>
                    <button
                      onClick={() => copyToClipboard(userData?.accessKey)}
                      className='hover:bg-slate-100 hover:rounded-md p-1'>
                      {svgCopyMini}
                    </button>
                  </div>
                  <div className='flex mt-7 xl:mt-5 items-center'>
                    <div className='xl:w-[100px] w-[120px]'>Secret Key</div>
                    <div className='xl:mr-6 mr-12 w-1/2 overflow-auto whitespace-nowrap'>
                      {userData?.secretKey}
                    </div>
                    <button
                      onClick={() => copyToClipboard(userData?.secretKey)}
                      className='hover:bg-slate-100 hover:rounded-md p-1'>
                      {svgCopyMini}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-6 xl:text-14 text-16 md:flex md:justify-end'>
              <button
                onClick={openChangePasswordPopup}
                className='bg-blue-main  text-white rounded-[10px] py-2 px-3 mr-4'>
                비밀번호 변경
              </button>
              {isChangePasswordPopupOpen && (
                <ChangePasswordPopup
                  isOpen={isChangePasswordPopupOpen}
                  onClose={closeChangePasswordPopup}
                  onChangePassword={handlePasswordChange}
                  password={passwordValid}
                />
              )}
              <button
                onClick={openDeletePopup}
                className='text-white bg-custom_red border-[0.5px] border-border rounded-[10px] py-2 px-3'>
                계정 삭제
              </button>
              {isDeletePopupOpen && (
                <DeleteAccountPopup
                  isOpen={isDeletePopupOpen}
                  onClose={closeDeletePopup}
                  onDelete={handleDeleteAccount}
                  passwordCorrect={passwordCorrect}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
export default AdminProfilePage;
