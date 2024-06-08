import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Loader from "../assets/loader.gif";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { SetAvatarRoute } from '../utils/APIRoutes';
import { Buffer } from 'buffer';

export default function SetAvatar() {
  const api = "https://api.multiavatar.com/45678945";
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOption = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(()=>{
    if(!localStorage.getItem("chat-app-user")){
      navigate("/login");
    }
  }, []);

  const setProfilePicture = async () => {
   if(selectedAvatar === undefined){
    toast.error("please select an avatar", toastOption);
   } else{
    const user = await JSON.parse(localStorage.getItem("chat-app-user"));
    const {data} = await axios.post(`${SetAvatarRoute}/${user._id}`,{
      image: avatars[selectedAvatar],
    });
    if(data.isSet){
      user.isAvatarImageSet = true;
      user.avatarImage = data.image;
      localStorage.setItem("chat-app-user",JSON.stringify(user));
      navigate("/");
    }else{
      toast.error("Error setting avatar.Please try again",toastOption);
    }
   }
  };

  useEffect(() => {
    axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

    const fetchAvatars = async () => {
      const data = [];
      for (let i = 0; i < 4; i++) {
        try {
          const response = await axios.get(`${api}/${Math.round(Math.random() * 1000)}`);
          const buffer = new Buffer(response.data);
          data.push(buffer.toString('base64'));
        } catch (error) {
          toast.error('Failed to fetch avatars. Please try again later.', toastOption);
        }
      }
      setAvatars(data);
      setIsLoading(false);
    };

    fetchAvatars();
  }, []);

  return (
    <>
      <Container>
        {isLoading ? (
          <img src={Loader} alt="Loading..." className="loader" />
        ) : (
          <>
            <div className="title-container">
              <h1>Pick an avatar as your profile picture</h1>
            </div>
            <div className="avatars">
              {avatars.map((avatar, index) => (
                <div
                  key={index}
                  className={`avatar ${selectedAvatar === index ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(index)}
                >
                  <img src={`data:image/svg+xml;base64,${avatar}`} alt="avatar" />
                </div>
              ))}
            </div>
            <button className="submit-btn" onClick={setProfilePicture}>
              Set as Profile Picture
            </button>
          </>
        )}
      </Container>
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;

      img {
        height: 6rem;
        transition: 0.5s ease-in-out;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }

  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;

    &:hover {
      background-color: #4e0eff;
    }
  }
`;
