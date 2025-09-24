import cogoToast from '@successtar/cogo-toast';
import { useEffect, useRef, useState } from 'react';
import { FaUpload, FaPaperPlane } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppSettings,
  saveAppSettings,
  sendTestEmail,
} from '../../../redux/slices/app-settings';
import { uploadAnonymousFile } from '../../../redux/slices/upload-files';
import FallbackImage from '../../common/FallbackImage';

const Settings = () => {
  const dispatch = useDispatch();
  const testEmailStatus = useSelector((state) => state.appSettings.testEmailStatus);
  const [logoUrl, setLogoUrl] = useState('/assets/atlas-logo.png');
  const [feedbackLink, setFeedbackLink] = useState('');
  const [appName, setAppName] = useState('Atlas');
  const [inviteCodeOption, setInviteCodeOption] = useState('disabled');
  const [authProviders, setAuthProviders] = useState({
    local: true,
    google: true,
    github: true,
  });
  const [supportEmail, setSupportEmail] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#660000');
  const [secondaryColor, setSecondaryColor] = useState('#006666');
  const [loading, setLoading] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const colorInputRef = useRef(null);
  const secondaryColorInputRef = useRef(null);
  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: '',
    encryption: 'TLS',
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    serverToken: '',
    messageStream: '',
  });

  const loadSettings = async () => {
    try {
      const resultAction = await dispatch(fetchAppSettings());
      if (fetchAppSettings.fulfilled.match(resultAction)) {
        const settings = resultAction?.payload;
        if (settings) {
          setLogoUrl(settings.logoUrl || '/assets/atlas-logo.png');
          setAppName(settings.appName || 'Atlas');
          setSupportEmail(settings.supportEmail || '');
          setFeedbackLink(settings.feedbackLink || '');
          setPrimaryColor(settings.primaryColor || '#660000');
          setSecondaryColor(settings.secondaryColor || '#006666');
          setInviteCodeOption(settings.inviteCodeOption || 'disabled');
          setAuthProviders(
            settings.authProviders || {
              local: true,
              google: true,
              github: true,
            },
          );
          // CHANGED: populate serverToken and messageStream if present
          setSmtpSettings({
            host: settings.smtpSettings?.host || '',
            port: settings.smtpSettings?.port || '',
            encryption: settings.smtpSettings?.encryption || 'TLS',
            username: settings.smtpSettings?.username || '',
            password: settings.smtpSettings?.password || '',
            fromEmail: settings.smtpSettings?.fromEmail || '',
            fromName: settings.smtpSettings?.fromName || '',
            serverToken: settings.smtpSettings?.serverToken || '',
            messageStream: settings.smtpSettings?.messageStream || '',
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [dispatch]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploaded = await dispatch(uploadAnonymousFile(file)).unwrap();
      const url = uploaded.fileUrl || uploaded.url;

      if (url) {
        setLogoUrl(url);
        cogoToast.success('Logo uploaded successfully.');
      } else {
        cogoToast.error('No URL returned from upload.');
      }
    } catch (err) {
      cogoToast.error('Upload failed.');
    }
  };
  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      cogoToast.error('Please enter an email address');
      return;
    }

    try {
      setTestEmailSending(true);

      await dispatch(
        saveAppSettings({
          smtpSettings,
        }),
      ).unwrap();

      await dispatch(sendTestEmail(testEmailAddress)).unwrap();
      cogoToast.success('Test email sent successfully!');
    } catch (error) {
      cogoToast.error(
        error?.message || 'Failed to send test email. Please check your SMTP settings.',
      );
    } finally {
      setTestEmailSending(false);
    }
  };

  const handleSaveAllSettings = async () => {
    try {
      setLoading(true);
      await dispatch(
        saveAppSettings({
          logoUrl,
          feedbackLink,
          appName,
          supportEmail,
          primaryColor,
          secondaryColor,
          inviteCodeOption,
          authProviders,
          smtpSettings,
        }),
      ).unwrap();

      cogoToast.success('App settings saved successfully.');
      loadSettings();
    } catch (err) {
      cogoToast.error('Failed to save app settings.');
    } finally {
      setLoading(false);
    }
  };

  const openColorPicker = () => {
    colorInputRef.current?.click();
  };

  const canSendTest =
    !!smtpSettings.host &&
    !!smtpSettings.port &&
    !!smtpSettings.fromEmail &&
    !!smtpSettings.fromName &&
    ((smtpSettings.username && smtpSettings.password) || smtpSettings.serverToken);

  return (
    <div className="p-2">
      <div className="p-10 rounded-[18px] bg-custom-background-white h-auto max-h-[90%] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-custom-text-heading">App Settings</h2>
        </div>

        <section className="bg-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <FallbackImage
              src={logoUrl}
              alt="App Logo"
              className="w-24 h-24 rounded-full p-2 object-cover border"
            />

            <div>
              <p className="text-lg font-medium">Current Logo</p>
              <p className="text-sm text-gray-500">Recommended: 200x200 PNG</p>
            </div>
          </div>

          <label className="cursor-pointer flex items-center gap-2 rounded-lg bg-custom-main px-4 py-2 text-sm font-medium text-white shadow hover:bg-custom-secondary transition">
            <FaUpload className="w-4 h-4" />
            Upload New
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">App Name</h3>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="Enter app name"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
          />
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">Support Email</h3>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="Enter support email"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
          />
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">Feedback Link</h3>
          <input
            type="url"
            value={feedbackLink}
            onChange={(e) => setFeedbackLink(e.target.value)}
            placeholder="https://example.com/feedback"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
          />
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">SMTP Configuration</h3>
          <div className="grid grid-cols-1 items-center sm:grid-cols-2 gap-4">
            <div className="flex items-start flex-col gap-1">
              <label htmlFor="SMTP Host Server">
                SMTP Host Server
                <span className="text-md text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={smtpSettings.host}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                placeholder="Enter your host server"
                className="p-3 w-full rounded-lg border border-gray-300"
              />
            </div>

            <div className="flex items-start flex-col gap-1">
              <label htmlFor="Port">
                Port
                <span className="text-md text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                value={smtpSettings.port}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                placeholder="Enter your port"
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            <div className="flex items-start flex-col gap-1">
              <label htmlFor="TLS">
                Certificate <span className="text-md text-red-500">*</span>
              </label>

              <select
                value={smtpSettings.encryption}
                onChange={(e) =>
                  setSmtpSettings({
                    ...smtpSettings,
                    encryption: e.target.value,
                  })
                }
                className=" w-full p-3 rounded-lg border border-gray-300"
              >
                <option value="TLS">TLS</option>
                <option value="SSL">SSL</option>
              </select>
            </div>

            <div className="flex items-start flex-col gap-1">
              <label htmlFor="userName">
                {' '}
                Username <span className="text-md text-red-500">*</span>
              </label>
              <input
                type="text"
                value={smtpSettings.username}
                onChange={(e) =>
                  setSmtpSettings({
                    ...smtpSettings,
                    username: e.target.value,
                  })
                }
                placeholder="Username"
                className=" w-full p-3 rounded-lg border border-gray-300"
              />
            </div>
            <div className="flex items-start flex-col gap-1">
              <label htmlFor="Password">
                {' '}
                Password <span className="text-md text-red-500 ml-1">*</span>
              </label>

              <input
                type="password"
                value={smtpSettings.password}
                onChange={(e) =>
                  setSmtpSettings({
                    ...smtpSettings,
                    password: e.target.value,
                  })
                }
                placeholder="Password"
                className=" w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            <div className="flex items-start flex-col gap-1">
              <label htmlFor="serverToken">
                Server Token <span className="text-md text-gray-500 ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={smtpSettings.serverToken}
                onChange={(e) =>
                  setSmtpSettings({
                    ...smtpSettings,
                    serverToken: e.target.value,
                  })
                }
                placeholder="Enter server token (e.g. Postmark token)"
                className=" w-full p-3 rounded-lg border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                If provided, token will be used as username and password when sending emails.
              </p>
            </div>

            <div className="flex items-start flex-col gap-1">
              <label htmlFor="messageStream">
                Message Stream <span className="text-md text-gray-500 ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={smtpSettings.messageStream}
                onChange={(e) =>
                  setSmtpSettings({
                    ...smtpSettings,
                    messageStream: e.target.value,
                  })
                }
                placeholder="e.g. outbound"
                className=" w-full p-3 rounded-lg border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                When provided, a header{' '}
                <code className="font-mono">X-PM-Message-Stream: &lt;value&gt;</code> will be
                attached to outgoing messages.
              </p>
            </div>

            <div className="flex items-start flex-col gap-1">
              <label htmlFor="email">
                {' '}
                Email <span className="text-md text-red-500 ml-1">*</span>
              </label>

              <input
                type="email"
                value={smtpSettings.fromEmail}
                onChange={(e) =>
                  setSmtpSettings({
                    ...smtpSettings,
                    fromEmail: e.target.value,
                  })
                }
                placeholder="From Email"
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>
            <div className="flex items-start flex-col gap-1">
              <label htmlFor="email">
                {' '}
                Name <span className="text-md text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                value={smtpSettings.fromName}
                onChange={(e) =>
                  setSmtpSettings({
                    ...smtpSettings,
                    fromName: e.target.value,
                  })
                }
                placeholder="From Name"
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Subject lines will be prepended with: <strong>{appName || 'Platform'}:</strong>
          </p>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-medium mb-3">
              Test Email Configuration <span className="text-md text-red-500 ml-1">*</span>
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter email address to test"
                className="flex-grow p-3 rounded-lg border border-gray-300"
              />
              <button
                onClick={handleSendTestEmail}
                disabled={!canSendTest || testEmailSending}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition ${
                  !canSendTest || testEmailSending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-custom-main hover:bg-custom-secondary'
                }`}
              >
                <FaPaperPlane className="w-4 h-4" />
                {testEmailSending ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {!smtpSettings.host ||
              !smtpSettings.port ||
              !smtpSettings.fromEmail ||
              !smtpSettings.fromName
                ? 'Complete the SMTP configuration above before sending a test email.'
                : 'Send a test email to verify your SMTP configuration is working correctly.'}
            </p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">Primary Color</h3>
          <div className="relative">
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full p-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
            />
            <div
              className="w-6 h-6 rounded-full absolute top-1/2 left-3 -translate-y-1/2 border cursor-pointer"
              style={{ backgroundColor: primaryColor }}
              onClick={openColorPicker}
              title="Pick a color"
            />
            <input
              ref={colorInputRef}
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="hidden"
            />
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">Secondary Color</h3>
          <div className="relative">
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-full p-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-main"
            />
            <div
              className="w-6 h-6 rounded-full absolute top-1/2 left-3 -translate-y-1/2 border cursor-pointer"
              style={{ backgroundColor: secondaryColor }}
              onClick={() => secondaryColorInputRef.current?.click()}
              title="Pick a color"
            />
            <input
              ref={secondaryColorInputRef}
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="hidden"
            />
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">Invite Codes</h3>
          <div className="flex items-center space-x-6">
            {['disabled', 'enabled', 'required'].map((option) => (
              <label key={option} className="flex items-center space-x-2 text-black capitalize">
                <input
                  type="radio"
                  name="inviteCodeOption"
                  value={option}
                  checked={inviteCodeOption === option}
                  onChange={(e) => setInviteCodeOption(e.target.value)}
                  className="appearance-none w-5 h-5 border-2 border-custom-main rounded-full focus:outline-none checked:relative checked:after:content-[''] checked:after:block checked:after:w-2.5 checked:after:h-2.5 checked:after:rounded-full checked:after:bg-custom-main checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-4">Authentication Providers</h3>
          <div className="flex items-center space-x-6">
            {['local', 'google', 'github'].map((provider) => (
              <label key={provider} className="flex items-center space-x-2 text-black capitalize">
                <input
                  type="checkbox"
                  checked={authProviders[provider]}
                  onChange={(e) =>
                    setAuthProviders((prev) => ({
                      ...prev,
                      [provider]: e.target.checked,
                    }))
                  }
                  className="appearance-none w-5 h-5 border-2 border-custom-main rounded-sm bg-white checked:bg-custom-main checked:border-custom-main checked:bg-check-icon focus:outline-none"
                />
                <span className="text-sm">
                  {provider === 'local'
                    ? 'Local Auth'
                    : provider === 'google'
                      ? 'Google'
                      : 'GitHub'}
                </span>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">(Existing accounts will be preserved)</p>
        </section>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveAllSettings}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white text-sm font-semibold transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-custom-main hover:bg-custom-secondary'
            }`}
          >
            {loading ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
