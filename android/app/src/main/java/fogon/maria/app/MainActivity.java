package fogon.maria.app;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    getOnBackPressedDispatcher()
      .addCallback(
        this,
        new OnBackPressedCallback(true) {
          @Override
          public void handleOnBackPressed() {
            Bridge bridge = getBridge();
            if (bridge != null && bridge.getWebView() != null) {
              bridge
                .getWebView()
                .evaluateJavascript(
                  "(function(){history.length>1?history.back():window.dispatchEvent(new Event('popstate'));})()",
                  null
                );
            }
          }
        }
      );
  }
}
