import { SetStateAction, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import i18next from 'i18next';

const UserPreferencesComponent = () => {
    const { t } = useTranslation();

    const handleLanguageChange = (e: any) => {
        i18next.changeLanguage(e.target.value);
    };

    return (
        <div className="App">
            <nav style={{ width: '100%', padding: '2rem 0', backgroundColor: '#007bff' }}>
                <h3> Change Language to:</h3>
                
                <div className="nav-item">
                    <select
                        className="nav-link bg-white border-0 ml-1 mr-2"
                        
                        onChange={handleLanguageChange}
                    >
                        <option value="en">{t('preferences.English') as string}</option>
                        <option value="ko">{t('preferences.Korean') as string}</option>
                        <option value="fr">{t('preferences.French') as string}</option>
                        <option value="de"> {t('preferences.German') as string}</option>
                        <option value="pt">{t('preferences.Portuguese') as string}</option>
                        <option value="ar"> {t('preferences.Arabic') as string}</option>
                    </select>
                </div>
                
            </nav>
            
        </div>
    );
}
export default UserPreferencesComponent
