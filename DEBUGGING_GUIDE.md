# 🚨 TALE FORGE DEBUGGING GUIDE

## 🔍 **Critical Issues Identified:**

### **1. Edge Function Still Failing**
### **2. Realtime Subscription Channel Error**

---

## 🛠️ **IMMEDIATE DEBUGGING STEPS:**

### **Step 1: Deploy Enhanced Edge Function**

```bash
# Deploy the enhanced Edge Function with comprehensive logging
supabase functions deploy test-elevenlabs-voices

# Check deployment status
supabase functions list

# Monitor logs in real-time
supabase functions logs test-elevenlabs-voices --follow
```

### **Step 2: Test Edge Function Directly**

```bash
# Test with curl (replace with your actual Supabase URL and anon key)
curl -X GET https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/test-elevenlabs-voices \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### **Step 3: Check Supabase Dashboard**

1. **Go to Supabase Dashboard → Edge Functions → Logs**
2. **Find recent calls to `test-elevenlabs-voices`**
3. **Copy exact error message and status code**
4. **Check Environment Variables → Secrets → `ELEVENLABS_API_KEY`**

### **Step 4: Test in Browser Console**

Open browser console and run:

```javascript
// Test Edge Function
const { data, error } = await supabase.functions.invoke('test-elevenlabs-voices');
console.log('Edge Function Result:', { data, error });

// Test Realtime Connection
const channel = supabase.channel('test-channel');
channel.subscribe((status, err) => {
  console.log('Realtime Status:', status, err);
});
```

---

## 🔧 **COMPREHENSIVE FIXES IMPLEMENTED:**

### **1. Enhanced Edge Function (`test-elevenlabs-voices`)**

✅ **Added comprehensive logging**
✅ **Better error handling with specific status codes**
✅ **Environment variable validation**
✅ **API response validation**
✅ **User info fetching for account status**

### **2. Improved Realtime Subscription (`useStorySegmentRealtime`)**

✅ **Exponential backoff reconnection logic**
✅ **Better error handling and logging**
✅ **Channel cleanup and management**
✅ **Status tracking and debugging**

### **3. Enhanced Voice Selector (`VoiceSelector`)**

✅ **Comprehensive error handling**
✅ **Debug mode with detailed information**
✅ **Fallback voice system**
✅ **API status tracking**
✅ **Network error detection**

### **4. Debug Utilities (`debugUtils.ts`)**

✅ **Full system diagnostics**
✅ **Edge Function testing**
✅ **Realtime connection testing**
✅ **Network connectivity testing**
✅ **Debug report generation**

---

## 🎯 **TESTING CHECKLIST:**

### **Edge Function Testing:**

- [ ] **Deploy Edge Function**: `supabase functions deploy test-elevenlabs-voices`
- [ ] **Check Environment**: Verify `ELEVENLABS_API_KEY` in Supabase secrets
- [ ] **Test Direct Call**: Use curl or browser console
- [ ] **Monitor Logs**: Check Supabase dashboard logs
- [ ] **Verify Response**: Should return 200 with voices array

### **Realtime Testing:**

- [ ] **Test Connection**: Use debug utilities
- [ ] **Monitor Channels**: Check for CHANNEL_ERROR
- [ ] **Verify Reconnection**: Test exponential backoff
- [ ] **Check Database**: Verify RLS policies allow realtime

### **Voice Selector Testing:**

- [ ] **Load Component**: Check for voice loading
- [ ] **Test Debug Mode**: Click debug button
- [ ] **Verify Fallbacks**: Should show fallback voices on error
- [ ] **Check Status**: Should show loading/success/error states

---

## 🚨 **COMMON ISSUES & SOLUTIONS:**

### **Issue 1: 401 Unauthorized**

**Cause**: Missing or invalid API key
**Solution**: 
1. Check Supabase secrets for `ELEVENLABS_API_KEY`
2. Verify ElevenLabs account status
3. Test API key directly with ElevenLabs

### **Issue 2: 429 Rate Limited**

**Cause**: ElevenLabs API quota exceeded
**Solution**:
1. Check ElevenLabs account usage
2. Wait for quota reset
3. Upgrade ElevenLabs plan if needed

### **Issue 3: CHANNEL_ERROR**

**Cause**: Realtime subscription issues
**Solution**:
1. Check Supabase realtime settings
2. Verify RLS policies
3. Test network connectivity
4. Use fallback polling

### **Issue 4: Network Errors**

**Cause**: Connectivity issues
**Solution**:
1. Check internet connection
2. Test with debug utilities
3. Verify Supabase URL and keys
4. Check firewall/proxy settings

---

## 📊 **DEBUGGING COMMANDS:**

### **Browser Console Commands:**

```javascript
// Run full diagnostics
import { runFullDiagnostics } from '@/utils/debugUtils';
await runFullDiagnostics();

// Test specific components
import { testEdgeFunction, testRealtimeConnection } from '@/utils/debugUtils';
await testEdgeFunction('test-elevenlabs-voices');
await testRealtimeConnection();

// Generate debug report
import { logDebugReport, downloadDebugReport } from '@/utils/debugUtils';
logDebugReport();
downloadDebugReport();
```

### **Supabase CLI Commands:**

```bash
# List all functions
supabase functions list

# Deploy specific function
supabase functions deploy test-elevenlabs-voices

# View function logs
supabase functions logs test-elevenlabs-voices --follow

# Check function status
supabase functions status test-elevenlabs-voices
```

---

## 🔍 **MONITORING & ALERTS:**

### **Key Metrics to Monitor:**

1. **Edge Function Response Time**: Should be < 5 seconds
2. **Voice Loading Success Rate**: Should be > 95%
3. **Realtime Connection Status**: Should be 'SUBSCRIBED'
4. **Error Rate**: Should be < 5%

### **Alert Conditions:**

- Edge Function returning non-2xx status
- Voice loading taking > 10 seconds
- Realtime CHANNEL_ERROR occurring
- Network connectivity issues

---

## 📝 **NEXT STEPS:**

1. **Deploy the enhanced Edge Function**
2. **Test with the debugging utilities**
3. **Monitor logs for specific error messages**
4. **Verify ElevenLabs API key and account status**
5. **Test realtime subscriptions**
6. **Generate debug report if issues persist**

---

## 🆘 **EMERGENCY CONTACTS:**

- **Supabase Support**: Check dashboard for status
- **ElevenLabs Support**: Verify API key and account
- **Network Issues**: Test connectivity with debug utilities

---

**The enhanced logging will reveal the exact cause of the issues! 🔍** 