// Copyright (c) Chris Oje 2024
using System;
using UnityEngine;

namespace ImmersiveMusic
{
    public class AbletonAudioStream : MonoBehaviour
    {
        private readonly string voicemeeterDeviceName = "VoiceMeeter Output (VB-Audio VoiceMeeter VAIO)";

        [SerializeField] private AudioSource audioSource;
        private AudioClip audioClip;

        public bool IsPlaying => audioSource.isPlaying;

        private void Start()
        {
//TODO: This needs to be set so the audio continues to play even when the app is not in focus (should move to a better place than here though)
            Application.runInBackground = true;
        }

        private void OnEnable()
        {
            InitializeAudioStream();
            Play();
        }

        private void OnDisable()
        {
            Clear();
        }

        public void Play()
        {
            audioSource.Play();
        }

        public void Stop()
        {
            audioSource.Stop();
        }

        public void TogglePlay()
        {
            if (IsPlaying)
            {
                Stop();
            }
            else
            {
                Play();
            }
        }

        public void Pause()
        {
            audioSource.Pause();
        }

        public void UnPause()
        {
            audioSource.UnPause();
        }

        public void TogglePause()
        {
            if (IsPlaying)
            {
                Pause();
            }
            else
            {
                UnPause();
            }
        }

//TODO: Refactor or move
        private readonly int sampleRate = 44100;
        private static int clipLengthSecs = 30;

        public void InitializeAudioStream()
        {
            Debug.Log($"Starting AbletonAudioStream from {Microphone.devices.Length} microphone devices...");
            foreach (var device in Microphone.devices)
            {
                Debug.Log($"Device Name: {device}");
            }

            try
            {
                Debug.Log($"Starting microphone with {voicemeeterDeviceName} | sampleRate: {sampleRate}, clipLengthSecs: {clipLengthSecs}");
                audioClip = Microphone.Start(voicemeeterDeviceName, loop: true, clipLengthSecs, sampleRate); //TODO: Hardcoding and error checking
            }
            catch (Exception ex)
            {
                Debug.LogError($"Error starting microphone: {ex.Message}");
            }

            audioSource.clip = audioClip;
        }

        public void Clear()
        {
            Stop();
            audioClip = null;
        }
    }
}
