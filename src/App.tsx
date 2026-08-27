import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { accountService } from "./service/accountService";
import "./styles/main.scss"

export default function App() {
  useEffect(() => {
    const fetchSettingsAndApply = async () => {
      try {
        let userId = 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c'; // DEFAULT_USER_ID
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u && u.id) userId = u.id;
        }

        const settings = await accountService.getAccountSettings(userId);
        
        if (settings.darkMode) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }

        if (settings.compactView) {
          document.body.classList.add('compact-view');
        } else {
          document.body.classList.remove('compact-view');
        }
      } catch (err) {
        console.error('Failed to load global appearance settings', err);
      }
    };

    fetchSettingsAndApply();
  }, []);
  return (
    <>
      <Outlet />
    </>
  )
}