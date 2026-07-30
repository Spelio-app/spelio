package app.spelio.twa;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;

import com.google.androidbrowserhelper.trusted.LauncherActivity;

public class SpelioLauncherActivity extends LauncherActivity {
    private static final int TABLET_SMALLEST_WIDTH_DP = 600;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Configuration configuration = getResources().getConfiguration();
        int orientation = configuration.smallestScreenWidthDp < TABLET_SMALLEST_WIDTH_DP
            ? ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            : ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED;
        setRequestedOrientation(orientation);
        super.onCreate(savedInstanceState);
    }
}
