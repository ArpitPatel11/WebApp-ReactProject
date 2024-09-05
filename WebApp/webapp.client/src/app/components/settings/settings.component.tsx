import React from 'react';
import './settings.component.scss';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { FaShieldAlt, FaUserAlt, FaUserCircle, FaCog } from "react-icons/fa";
import { Permissions } from '../../models/permission.model';
import { AccountService } from '../../services/account.service';
import { AddEdit } from '../controls/user-info-form';
import UsersManagementComponent from '../controls/users-management-component';
import RolesManagementComponent from '../controls/roles-management-component';
import UserPreferencesComponent from '../controls/user-preferences.component';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

const Settings = () => {

    const accountService = new AccountService();

    const [activeTab, SetActivetab] = React.useState('1');

    const toggle = (tab: any) => {
        if (activeTab !== tab) {
            SetActivetab(tab);
        }
    }

    function canViewUsers() {
        return accountService.userHasPermission(Permissions.viewUsers);
    }

    function canViewRoles() {
        return accountService.userHasPermission(Permissions.viewRoles);
    }

    const { t, i18n } = useTranslation();

    return (
        <div>
            <div className="container settings-page">
                <header className="pageHeader">
                    <h3><i className="fa fa-cog fa-lg page-caption" aria-hidden="true"></i><FaCog />{t('Settings') as string}</h3>
                </header>

                <div>
                    <div className="d-sm-flex flex-row mb-2">

                        <Nav tabs className="nav nav-tabs nav-tabs--vertical nav-tabs--left">
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === '1' })}
                                    onClick={() => { toggle('1'); }}>
                                    <FaUserCircle /> {t('Profile') as string}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === '2' })}
                                    onClick={() => { toggle('2'); }} >
                                    <FaShieldAlt /> {t('Preferences') as string}
                                </NavLink>
                            </NavItem>
                            {canViewUsers() ?
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: activeTab === '3' })}
                                        onClick={() => { toggle('3'); }} >
                                        <FaUserAlt /> {t('Users') as string}
                                    </NavLink>
                                </NavItem> : null}
                            {canViewRoles() ?
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: activeTab === '4' })}
                                        onClick={() => { toggle('4'); }} >
                                        <FaShieldAlt /> {t('Roles') as string}
                                    </NavLink>
                                </NavItem> : null}
                        </Nav>
                        <div className="tab-content w-100">
                            <TabContent activeTab={activeTab}>
                                <TabPane tabId="1">

                                    <h4>{t('UserProfile') as string}</h4>
                                    <hr />
                                    <div className="content-container pl-lg-2">
                                        {/*<UserInfoComponent />*/}
                                        <AddEdit />
                                    </div>
                                </TabPane>
                                <TabPane tabId="2">
                                    <h4>{t('UserPreferences') as string}</h4>
                                    <hr />
                                    <div className="content-container pl-lg-2">
                                        <UserPreferencesComponent />
                                    </div>
                                </TabPane>

                                <TabPane tabId="3">
                                    <h4>{t('UsersManagements') as string}</h4>
                                    <hr />
                                    <div className="content-container pl-lg-2">
                                        <UsersManagementComponent />
                                    </div>
                                </TabPane>

                                <TabPane tabId="4">
                                    <h4>{t('RolesManagement') as string}</h4>
                                    <hr />
                                    <div className="content-container pl-lg-2">
                                        {/* <RolesManagementComponent /> */}
                                    </div>
                                </TabPane>
                            </TabContent>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings