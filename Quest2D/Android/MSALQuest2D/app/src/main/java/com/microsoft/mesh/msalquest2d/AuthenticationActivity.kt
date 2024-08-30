import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.microsoft.identity.client.exception.MsalException
import com.microsoft.identity.client.PublicClientApplication
import com.microsoft.identity.client.IPublicClientApplication
import com.microsoft.identity.client.ISingleAccountPublicClientApplication
import com.microsoft.mesh.msalquest2d.R

class AuthenticationActivity : AppCompatActivity() {

	private lateinit var msalApp: ISingleAccountPublicClientApplication

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_authentication)

		// Initialize MSAL using the single account public client application
		PublicClientApplication.createSingleAccountPublicClientApplication(
			applicationContext,
			R.raw.msal_config,
			object : IPublicClientApplication.ISingleAccountApplicationCreatedListener {
				override fun onCreated(application: ISingleAccountPublicClientApplication) {
					msalApp = application
				}

				override fun onError(exception: MsalException) {
					// Handle the error
				}
			}
		)
	}
}
