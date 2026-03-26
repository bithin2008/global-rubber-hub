package com.swayangjit.installreferrer;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import java.util.Map;

/**
 * This plugin utilizes the play install referrer API to get the referrer details from playstore.
 */
public class InstallReferrerPlugin extends CordovaPlugin {
    private static final String GET_REFERRER = "getReferrer";

    @Override
    protected void pluginInitialize() {
        super.pluginInitialize();
    }

    /**
     * Executes the request.
     * <p>
     * This method is called from the WebView thread. To do a non-trivial
     * amount of work, use:
     * cordova.getThreadPool().execute(runnable);
     * <p>
     * To run on the UI thread, use:
     * cordova.getActivity().runOnUiThread(runnable);
     *
     * @param action          The action to execute.
     * @param args            The exec() arguments in JSON form.
     * @param callbackContext The callback context used when calling back into
     *                        JavaScript.
     * @return Whether the action was valid.
     */
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals(GET_REFERRER)) {
            this.getReferrer(callbackContext);
            return true;
        }
        return false;
    }

    /**
     * Retrieves referrer details
     *
     * @param callbackContext The callback context used when calling back into JavaScript.
     */
    private void getReferrer(CallbackContext callbackContext) {
        PlayStoreInstallReferrerImpl playStoreInstallreferrerImpl = new PlayStoreInstallReferrerImpl();
        playStoreInstallreferrerImpl.start(cordova.getActivity(), new InstallReferrerListener() {
            @Override
            public void onHandleReferrer(Map<String, String> properties) {
                callbackContext.success(new JSONObject(properties));
            }
        });
    }
}
