// Copyright (c) Chris Oje 2024
using extOSC;
using System.Text;
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

//TODO: Some specific tests - need a better system for this
        [SerializeField] private string _basslineVolumeAddress = "/bassline_volume";
        [SerializeField] private string _toggleShifterTremeloAddress = "/toggle_shifter_tremelo";

        // Track Controller supported OSC addresses
        [SerializeField] private string trackname = "/trackname";
        [SerializeField] private string tempo = "/tempo";
        [SerializeField] private string volume = "/volume";
        [SerializeField] private string reverb_decay = "/reverb_decay";

        // Tracks we support
        [SerializeField] private string bassline = "bassline";
        [SerializeField] private string drums = "drums";

        //[Header("OSC Messages")]
        //public Text TransmitterTextFloat;
        //public Text TransmitterTextInt;

        private void Start()
        {
            Receiver.Bind(_SampleFloatAddress, ReceiveSampleFloat);
            Receiver.Bind(_SampleIntAddress, ReceiveSampleInt);
            Receiver.Bind(_TogglePlayAddress, ReceiveTogglePlay);

//TODO:
            Receiver.Bind(_basslineVolumeAddress, ReceiveOSCMessage);
            Receiver.Bind(_toggleShifterTremeloAddress, ReceiveOSCMessage);

//TODO: Supported track controller OSC addresses
//TODO: Need a better way to create and descontruct the addresses (get the track etc)
            Receiver.Bind($"/{bassline}{trackname}", ReceiveOSCMessage);
            Receiver.Bind($"/{bassline}{tempo}", ReceiveOSCMessage);
            Receiver.Bind($"/{bassline}{volume}", ReceiveOSCMessage);
            Receiver.Bind($"/{bassline}{reverb_decay}", ReceiveOSCMessage);
            Receiver.Bind($"/{drums}{trackname}", ReceiveOSCMessage);
            Receiver.Bind($"/{drums}{tempo}", ReceiveOSCMessage);
            Receiver.Bind($"/{drums}{volume}", ReceiveOSCMessage);
            Receiver.Bind($"/{drums}{reverb_decay}", ReceiveOSCMessage);

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


        static bool _toggle = false;

        public void ReceiveOSCMessage(OSCMessage message)
        {
            StringBuilder str = new StringBuilder();
            str.AppendLine($"ReceiveOSCMessage: {message.Address} | {message.Ip} : {message.Port}");
            foreach (var value in message.Values)
            {
                str.AppendLine($"{value.Type}: {value.Value}");
            }
            Debug.Log(str);

//TODO: Hack
            _toggle = !_toggle;
            Send("/toggle_drum_electrifier", OSCValue.Impulse());
            Send("/toggle_brain_dance", OSCValue.Bool(_toggle));
            Send("/toggle_ambidel", OSCValue.Float(_toggle ? 1f : 0f));
            Send("/breakbeats_volume", OSCValue.Float(-25f));
        }

        #endregion Reciever Methods

        /*public static int RemapValue(float value, float inputMin, float inputMax, int outputMin, int outputMax)
        {
            return (int)((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
        }*/
    }
}
