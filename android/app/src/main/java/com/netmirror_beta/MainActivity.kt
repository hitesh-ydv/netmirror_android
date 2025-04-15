package com.netmirror_beta

import android.os.Bundle
import android.view.View
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView 

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "netmirror_beta"

override fun createReactActivityDelegate(): ReactActivityDelegate {
  return object : ReactActivityDelegate(this, mainComponentName, fabricEnabled) {
    override fun createRootView(): RNGestureHandlerEnabledRootView {
      return RNGestureHandlerEnabledRootView(context)
    }
  }
}


  // ✅ Optional: Hide navigation bar on Android
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    window.decorView.systemUiVisibility = (
      View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
    )
  }
}
