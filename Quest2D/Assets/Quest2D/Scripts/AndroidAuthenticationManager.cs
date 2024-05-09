using UnityEngine;

public class AndroidAuthenticationManager : MonoBehaviour
{
    public readonly string TAG = nameof(AndroidAuthenticationManager);

    public static AndroidAuthenticationManager Instance { get; private set; }

	public string UnityPlayerActivityPackageName => "com.unity3d.player";
	public string UnityPlayerClassName => UnityPlayerActivityPackageName + ".UnityPlayer";
	public string AuthenticationActivityPackageName => "com.microsoft.mesh.msalquest2d";
	public string AuthenticationActivityClassName => AuthenticationActivityPackageName + ".AuthenticationActivity";
	public string AuthenticationActivityIntentActionName => AuthenticationActivityPackageName + ".AUTHENTICATION";
	public string IntentClassName => "android.content.Intent";
	public string CurrentActivityMethodName => "currentActivity";
	public string StartActivityMethodName => "startActivity";
	public string SetActionMethodName => "setAction";
	public string SetClassNameMethodName => "setClassName";

	public enum Activity
	{
		UnityPlayer,
		Authentication
	}

    public bool UnityPlayerActivityRunning => CurrentActivity == Activity.UnityPlayer;
	public bool AuthenticationActivityRunning => CurrentActivity == Activity.Authentication;

	public Activity CurrentActivity { get; private set; } = Activity.UnityPlayer;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void OnEnable()
    {
		const float delaySeconds = 3f;
        Invoke(nameof(LaunchAuthenticationActivity), delaySeconds);	// Delay briefly before launching activity so we can see the main unity activity start as a test...
    }

    private void OnDisable()
    {
		LaunchUnityPlayerActivity();
    }

//TODO: Implement this correctly for authentication activity
    public void LaunchAuthenticationActivity()
    {
        if (AuthenticationActivityRunning)
        {
            Debug.LogWarning($"{TAG}.LaunchAuthenticationActivity - Authentication Activity already running");
            return;
        }

        Debug.Log($"{TAG}.LaunchAuthenticationActivity - Launching Authentication Activity");

        using (var ajc = new AndroidJavaClass(UnityPlayerClassName))
        {
            var currentActivity = ajc.GetStatic<AndroidJavaObject>(CurrentActivityMethodName);
			if (currentActivity != null)
			{
				//string packageName = "com.microsoft.mesh.quest2d";//TODO: currentActivity.Call<string>("getPackageName");
				var componentName = new AndroidJavaObject("android.content.ComponentName", "com.microsoft.mesh.quest2d", "com.microsoft.mesh.msalquest2d.AuthenticationActivity");
				var intent = new AndroidJavaObject(IntentClassName);
				intent.Call<AndroidJavaObject>("setComponent", componentName);
				//intent.Call<AndroidJavaObject>("setComponent", new AndroidJavaObject("android.content.ComponentName", packageName, AuthenticationActivityClassName));

				//intent.Call<AndroidJavaObject>(SetActionMethodName, AuthenticationActivityIntentActionName);
				//intent.Call<AndroidJavaObject>(SetClassNameMethodName, currentActivity, AuthenticationActivityClassName);

				try
				{
					//currentActivity.Call(StartActivityMethodName, intent);
					currentActivity.Call("startActivity", intent);

					Debug.Log($"{TAG}.LaunchAuthenticationActivity - Intent successfully started");

					CurrentActivity = Activity.Authentication;
				}
				catch (System.Exception ex)
				{
					Debug.LogError($"{TAG}.LaunchAuthenticationActivity - Error launching Authentication activity: {ex.ToString()}");
				}
			}
			else
			{
				Debug.LogError($"{TAG}.LaunchAuthenticationActivity - Failed to get {CurrentActivityMethodName}.");
			}
		}
	}

//TODO: Implement this correctly for unity player activity
	public void LaunchUnityPlayerActivity()
	{
		if (UnityPlayerActivityRunning)
		{
			Debug.LogWarning($"{TAG}.LaunchUnityPlayerActivity - UnityPlayer Activity already running");
			return;
		}

		Debug.Log($"{TAG}.LaunchUnityPlayerActivity - Launching UnityPlayer Activity");  //TODO:.....
/*
		using (var ajc = new AndroidJavaClass(UnityPlayerClassName))
		{
			var currentActivity = ajc.GetStatic<AndroidJavaObject>(CurrentActivityMethodName);
			if (currentActivity != null)
			{
				try
				{
					var intent = new AndroidJavaObject(IntentClassName);
					intent.Call<AndroidJavaObject>(SetActionMethodName, AuthenticationActivityIntentActionName);
					intent.Call<AndroidJavaObject>(SetClassNameMethodName, currentActivity, AuthenticationActivityClassName);

					currentActivity.Call(StartActivityMethodName, intent);

					Debug.Log($"{TAG}.LaunchUnityPlayerActivity - Intent successfully started");

					CurrentActivity = Activity.UnityPlayer;
				}
				catch (System.Exception ex)
				{
					Debug.LogError($"{TAG}.LaunchUnityPlayerActivity - Error launching UnityPlayer activity: {ex.ToString()}");
				}
			}
			else
			{
				Debug.LogError($"{TAG}.LaunchUnityPlayerActivity - Failed to get {CurrentActivityMethodName}.");
			}
		}*/
	}

    public void ToggleAndroidActivity()
    {
        if (UnityPlayerActivityRunning)
        {
            LaunchAuthenticationActivity();
        }
		else if (AuthenticationActivityRunning)
		{
			LaunchUnityPlayerActivity();
		}
	}
}
