using UnityEngine;
using UnityEngine.XR.Management;

public class SimpleVRMovement : MonoBehaviour
{
	public float speed = 1.0f; // Speed of movement
	public float rotationSpeed = 60.0f; // Rotation speed in degrees per second

	private OVRCameraRig cameraRig;
	private Transform centerEyeAnchor;

	private void Start()
	{
		cameraRig = GetComponent<OVRCameraRig>();
		centerEyeAnchor = cameraRig.centerEyeAnchor; // This is typically the camera in the OVRCameraRig
	}

	private void OnEnable()
	{
		if (XRGeneralSettings.Instance.Manager.isInitializationComplete)
		{
			Debug.Log("XR is initialized and ready.");
		}
		else
		{
			Debug.Log("XR is not initialized.");
		}

		if (UnityEngine.XR.XRSettings.isDeviceActive)
		{
			Debug.Log($"XR device is active: {UnityEngine.XR.XRSettings.loadedDeviceName}");
		}
		else
		{
			Debug.Log("No XR device is active.");
		}

		if (OVRInput.IsControllerConnected(OVRInput.Controller.RTouch))
		{
			Debug.Log("Right controller is connected.");
		}
		else
		{
			Debug.Log("Right controller is NOT connected.");
		}
		if (OVRInput.IsControllerConnected(OVRInput.Controller.LTouch))
		{
			Debug.Log("Left controller is connected.");
		}
		else
		{
			Debug.Log("Left controller is NOT connected.");
		}
	}

	private void Update()
	{
		OVRInput.Update(); // Update the Oculus input

		// Movement input from the left thumbstick
		Vector2 moveInput = OVRInput.Get(OVRInput.Axis2D.PrimaryThumbstick);

		// Rotation input from the right thumbstick
		float rotateInput = OVRInput.Get(OVRInput.Axis2D.SecondaryThumbstick).x;

		// Get the forward and right vectors from the center eye anchor (camera)
		Vector3 forward = centerEyeAnchor.forward;
		Vector3 right = centerEyeAnchor.right;

		forward.y = 0;
		right.y = 0;

		forward.Normalize();
		right.Normalize();

		// Move the OVRCameraRig
		Vector3 desiredMoveDirection = speed * Time.deltaTime * (forward * moveInput.y + right * moveInput.x);
		cameraRig.transform.position += desiredMoveDirection;

		// Rotate the OVRCameraRig
		float rotationYaw = rotateInput * rotationSpeed * Time.deltaTime;
		cameraRig.transform.Rotate(0, rotationYaw, 0);

		//Debug.Log($"Move: {moveInput}, Rotate: {rotateInput}, Forward: {forward}, Right: {right}, Movement: {desiredMoveDirection}, rotationYaw: {rotationYaw}");

		// Now as a hack, we will also check for the other button inputs and handle it here, though we should do this in a more appropriate script
		HandleControllerButtons();
	}

	private void HandleControllerButtons()
	{
		// Check for A Button press on the right controller this frame
		if (OVRInput.GetDown(OVRInput.Button.One))
		{
			Debug.Log("A button was pressed.");
			AndroidAuthenticationManager.Instance.ToggleAndroidActivity();
		}

		// Check for B Button press on the right controller this frame
		if (OVRInput.GetDown(OVRInput.Button.Two))
		{
			Debug.Log("B button was pressed.");
		}

		// Check for X Button press on the left controller this frame
		if (OVRInput.GetDown(OVRInput.Button.Three))
		{
			Debug.Log("X button was pressed.");
		}

		// Check for Y Button press on the left controller this frame
		if (OVRInput.GetDown(OVRInput.Button.Four))
		{
			Debug.Log("Y button was pressed.");
		}
	}
}
