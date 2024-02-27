// Copyright (c) Chris Oje 2024
using extOSC;
using UnityEngine;

namespace ImmersiveMusic
{
    public class AbletonManager : MonoBehaviour
    {
        [Header("OSC Settings")]
        public OSCReceiver Receiver;
        public OSCTransmitter Transmitter;

        // OSC Address
//TODO: Implement these according to our app needs and what is supported in Ableton
        [Header("OSC Addresses")]
        [SerializeField] private string _SampleFloatAddress = "/sample/float/foo";
        [SerializeField] private string _SampleIntAddress = "/sample/int/foo";
        [SerializeField] private string _TogglePlayAddress = "/toggle_play";

        //[Header("OSC Messages")]
        //public Text TransmitterTextFloat;
        //public Text TransmitterTextInt;

        private void Start()
        {
            Receiver.Bind(_SampleFloatAddress, ReceiveSampleFloat);
            Receiver.Bind(_SampleIntAddress, ReceiveSampleInt);
            Receiver.Bind(_TogglePlayAddress, ReceiveTogglePlay);

//TODO: Not best place to do this, but a start
            SendSampleFloat(69f);
            SendSampleInt(77);
            SendTogglePlay();
        }

        #region Transmitter Methods

        public void SendSampleFloat(float value)
        {
            Debug.Log($"SendSampleFloat: {value}");
            Send(_SampleFloatAddress, OSCValue.Float(value));

//            TransmitterTextFloat.text = value.ToString();
        }

        public void SendSampleInt(int /*float*/ value)
        {
            var integerValue = value;// RemapValue(value, 0, 1, 0, int.MaxValue);

            Debug.Log($"SendSampleInt: {value} (as integer: {integerValue})");
            Send(_SampleIntAddress, OSCValue.Int(integerValue));

//            TransmitterTextInt.text = integerValue.ToString();
        }

        public void SendTogglePlay()
        {
            Debug.Log($"SendTogglePlay");
            Send(_TogglePlayAddress, OSCValue.Impulse());
        }

        private void Send(string address, OSCValue value)
        {
            var message = new OSCMessage(address, value);

            Transmitter.Send(message);
        }

        #endregion Transmitter Methods

        #region Reciever Methods

        public void ReceiveSampleFloat(OSCMessage message)
        {
            if (message.ToFloat(out var value))
            {
                Debug.Log($"ReceiveSampleFloat: {value}");
//                ReceiverTextFloat.text = value.ToString();
//                ReceiverSliderFloat.value = value;
            }
        }

        public void ReceiveSampleInt(OSCMessage message)
        {
            int value;
            if (message.ToInt(out value))
            {
//                ReceiverTextInt.text = value.ToString();

                var floatValue = (float)(value / (double)int.MaxValue);
//                ReceiverSliderInt.value = floatValue;

                Debug.Log($"ReceiveSampleInt: {value} (as float: {floatValue})");
            }
        }

        public void ReceiveTogglePlay(OSCMessage message)
        {
            if (message.HasImpulse())
            {
//                ImageBlink(ReceiverImageImpulse);

                Debug.Log($"ReceiveTogglePlay: has impulse");
            }
        }

        #endregion Reciever Methods

        /*public static int RemapValue(float value, float inputMin, float inputMax, int outputMin, int outputMax)
        {
            return (int)((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
        }*/
    }
}
