package com.swayangjit.installreferrer;

import java.util.Map;

/**
 * Created by swayangjit on 16/8/20.
 */

public interface InstallReferrerListener {
    void onHandleReferrer(Map<String, String> properties);
}
