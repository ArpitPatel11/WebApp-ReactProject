import * as React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { AccountService } from '../../services/account.service';
import { useForm } from "react-hook-form";
import { FaSave, FaTimes, FaEdit } from "react-icons/fa";
import { User } from '../../models/user.model';
import { UserEdit } from '../../models/user-edit.model';
import { Role } from '../../models/role.model';
import { Permissions } from '../../models/permission.model';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import './user-info-form.scss';
import { useTranslation } from 'react-i18next';

export const AddEdit = forwardRef((props: { changesSavedCallback?: any }, ref) => {
    const accountService = new AccountService();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [isPending, startTransition] = React.useTransition();
    const [isNewUser, setIsNewUser] = useState(false);
    let isSaving: boolean = false;
    const [isGeneralEditor, setIsGeneralEditor] = useState(false);
    const [roles, setRoles] = useState<Role[]>();
    const { register, setValue, handleSubmit, reset, formState: { errors, isSubmitted } } = useForm<UserEdit>();
    const [users, setUsers] = useState<UserEdit>();
    const [newPass, setNewPass] = useState("");
    const [confPass, setConfPass] = useState("");
    const [currentUser, setCurrentUser] = useState<any>();
    const { t } = useTranslation();

    React.useImperativeHandle(ref, () => ({
        editUser: (user: any) => {
            setUsers(user);
            setValue('id', user.id);
            setValue('roles', user.roles);
            startTransition(() => {
                setIsEditMode(true);
                setIsChangePassword(false);
                setIsNewUser(false);
            })
        },
        newUser: () => {
            setIsNewUser(true);
            setIsEditMode(true);
            setIsChangePassword(true);
            startTransition(() => {
                reset();
            })
        },
        cancel() {
            setIsEditMode(false);
            setIsNewUser(false);
            setIsChangePassword(false);
            reset();
        },
    }))

    const edit = () => {  
        setIsGeneralEditor(true);
        setValue('id', currentUser.id);
        setValue('roles', currentUser.roles);
        setIsEditMode(true);
        setIsChangePassword(false);
        setIsNewUser(false);     

    }

    const changePassword = () => {
        setIsChangePassword(true);
    }

    const handleChange = (selectedOptions: any) => {
        let tickedOptions: any[] = [];
        selectedOptions.map((o: any) =>
            tickedOptions.push(o.value)
        );
        setValue('roles', tickedOptions)

    }
    const loadCurrentUserData = () => {
        if (canViewAllRoles()) {
            accountService.getUserAndRoles().subscribe((results: any[]) => onCurrentUserDataLoadSuccessful(results[0], results[1]), (error: any) => onCurrentUserDataLoadFailed(error));
        }
        else {
            accountService.getUser().subscribe((user: User) => onCurrentUserDataLoadSuccessful(user, user.roles.map(() => new Role("", "", []))), (error: any) => onCurrentUserDataLoadFailed(error));
        }
    }

    const onCurrentUserDataLoadSuccessful = (user: any, roles: Role[]) => {   
        setCurrentUser(user);
        setUsers(user);
        setRoles(roles);
    }

    const onCurrentUserDataLoadFailed = (error: any) => {
        console.log(error);
    }

    function canViewAllRoles() {
        return accountService.userHasPermission(Permissions.viewRoles);
    }

    function cancel() {
        setIsEditMode(false);
        setIsNewUser(false);
        setIsChangePassword(false);
        reset();
        toast.error("Cancled, Operation cancelled by user", { toastId: "1", theme: 'colored'})
    }

    function Save(user: UserEdit) {
        if (user.roles == null) {
            toast.error("Role is required.", { theme: 'colored', toastId: "5" });
        }
        if (isNewUser) {
            // accountService.newUser(user).then((response: any) => saveSuccessHelper(), (error: any) => saveFailedHelper(error));
        } else {
            // accountService.updateUser(user).subscribe((response: any) => saveSuccessHelper(), (error: any) => saveFailedHelper(error));
        }
    }

    function saveSuccessHelper(user?: any) {
        isSaving = false;
       
        if (isGeneralEditor) {
            setIsGeneralEditor(false);
            setIsEditMode(false);
            setIsNewUser(false);
            setIsChangePassword(false);
        } else {
            props.changesSavedCallback();
        }    
        loadCurrentUserData();
        setIsNewUser(false);
        setIsEditMode(false);
        setIsChangePassword(false);
        if (isNewUser) {
            toast.success(`User ${user.userName} created successfully`, { toastId: "1", theme: 'colored' });
        }        
    }

    function saveFailedHelper(error: any) {
        var errorMsg =  error.response.data[""];
        isSaving = false;
        toast.error("Save Error, The below errors occured whilst saving your changes", { toastId: "1", theme: 'colored' });
        toast.error(`${errorMsg}`, { toastId: "2", theme: 'colored' });
    }

    let colourStyles:StylesConfig = {
        control: (styles: any) => ({ ...styles, borderLeft: '5px solid #ced4da' }),
        multiValueLabel: (base, state) => {
            return state
                ? { ...base, fontWeight: '500', color: '#fff' }
                : base;
        },
        multiValue: (styles) => {
            return {
                ...styles,
                borderRadius: 50,
                backgroundColor: '#7F8487',
            };
        },
    }

 

    useEffect(() => {
        loadCurrentUserData();
    }, []);

    return (
        <form onSubmit={handleSubmit(Save)}>
            <div className="row">
                <label className="col-lg-2" htmlFor="jobTitle">{t('JobTitle') as string}</label>
                <div className="col-lg-10">
                    {!isEditMode ? <p className="form-control-plaintext" >{users?.jobTitle}</p> : null}
                    {isEditMode && !isNewUser ?
                        <input type="text" className="form-control" defaultValue={users?.jobTitle} {...register('jobTitle')} placeholder="Enter Job Title." /> : null
                    }
                    {isNewUser ?
                        <input type="text" className="form-control" {...register('jobTitle')} placeholder="Enter Job Title." /> : null
                    }
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <hr className="separator-hr"></hr>
                </div>
            </div>

            <div className="row">
                <label className="col-lg-2" htmlFor="userName">{t('UserName') as string}</label>
                <div className="col-lg-10">
                    {!isEditMode ? <p className="form-control-plaintext" >{users?.userName}</p> : null}
                    {isEditMode && !isNewUser ?
                        <div>
                            <input type="text" defaultValue={users?.userName} placeholder="Enter User Name."
                                className={`form-control ${errors.userName ? 'is-invalid' : ''} ${!errors.userName && isSubmitted ? 'is-valid' : ''}`}
                                {...register('userName', { required: true, minLength: 2, maxLength: 200 })}
                            />
                            <div className="invalid-feedback">
                                {errors.userName?.type === 'required' && "User name is required (minimum of 2 and maximum of 200 characters)"}
                            </div>
                        </div>: null
                    }
                    {isNewUser ?
                        <div>
                            <input type="text" placeholder="Enter User Name."
                                className={`form-control ${errors.userName ? 'is-invalid' : ''} ${!errors.userName && isSubmitted ? 'is-valid' : ''}`}
                                {...register('userName', { required: true, minLength: 2, maxLength: 200 })}
                            />
                            <div className="invalid-feedback">
                                {errors.userName?.type === 'required' && "User name is required (minimum of 2 and maximum of 200 characters)"}
                            </div>
                        </div> : null
                    }
                </div>
            </div>

            <div className="row ">
                <div className="col-lg-12">
                    <hr className="separator-hr" />
                </div>
            </div>

            <div className="row">
                <label className="col-lg-2" htmlFor="email">{t('Email') as string}</label>
                <div className="col-lg-10">
                    {!isEditMode ? <p className="form-control-plaintext" >{users?.email}</p> : null}
                    {isEditMode && !isNewUser ?
                        <div>
                            <input type="email" defaultValue={users?.email} placeholder="Enter Email Address."
                                className={`form-control ${errors.email ? 'is-invalid' : ''} ${!errors.email && isSubmitted ? 'is-valid' : ''}`}
                                {...register('email', { required: true, maxLength: 200, pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/ })}
                            />
                            <div className="invalid-feedback">
                                {errors.email?.type === 'required' && "Email address is required (maximum of 200 characters)"}
                                {errors.email?.type === 'pattern' && "Enter a valid Email address."}
                            </div>
                        </div> : null
                    }
                    {isNewUser ?
                        <div>
                            <input type="email" placeholder="Enter Email Address."
                                className={`form-control ${errors.email ? 'is-invalid' : ''} ${!errors.email && isSubmitted ? 'is-valid' : ''}`}
                                {...register('email', { required: true, maxLength: 200, pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/ })}
                            />
                            <div className="invalid-feedback">
                                {errors.email?.type === 'required' && "Email address is required (maximum of 200 characters)"}
                                {errors.email?.type === 'pattern' && "Enter a valid Email address."}
                            </div>
                        </div> : null
                    }
                </div>
            </div>

            {isEditMode ?
                <div className="row">
                    <div className="col-lg-12">
                        <hr className="separator-hr" />
                    </div>
                </div> : null
            }

            {isEditMode ?
                <div className="row">
                    <label className="col-lg-2" htmlFor="userPassword">{t('Password') as string}</label>
                    <div className="col-lg-10">
                        {!isChangePassword && !isNewUser ?
                            <button type="button" onClick={changePassword} className="btn btn-link text-link">{t('users.editor.ChangePassword') as string}</button> : null
                        }
                        {isChangePassword ?
                            <div className="col-lg-10">

                                {isEditMode && !isNewUser ?
                                    <div className="password-well card card-body bg-light">
                                        <div className="row">
                                            <label className="col-form-label col-lg-3" >{t('CurrentPassword') as string}</label>
                                            <div className="col-lg-9">
                                                <input type="password" placeholder="Enter current password"
                                                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''} ${!errors.currentPassword && isSubmitted ? 'is-valid' : ''}`}
                                                    {...register('currentPassword', { required: true, minLength: 6 })}
                                                />
                                                <div className="invalid-feedback">{errors.currentPassword?.type === 'required' && "Current password is required"}</div>
                                            </div>
                                        </div>
                                        <div className="col-form-label row">
                                            <label className="col-form-label col-lg-3" >{t('NewPassword') as string}</label>
                                            <div className="col-lg-9">
                                                <input type="password" placeholder="Enter new password"
                                                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''} ${!errors.newPassword && isSubmitted ? 'is-valid' : ''}`}
                                                    {...register('newPassword', { required: true, minLength: 6, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{6,20}$/, onChange: ((event: any) => (isEditMode && !isNewUser ? setNewPass(event.target.value) : setNewPass(""))) })}
                                                />
                                                <div className="invalid-feedback">
                                                    {errors.newPassword?.type === 'required' && "New password is required (minimum of 6 characters)"}
                                                    {errors.newPassword?.type === 'pattern' && "New password must include 1 lowercase 1 uppercase 1 special character and 1 Numeric Value"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <label className="col-form-label col-lg-3" >{t('ConfirmPassword') as string}</label>
                                            <div className="col-lg-9">
                                                <input type="password" placeholder="Enter confirm password"
                                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''} ${!errors.confirmPassword && isSubmitted && newPass == confPass ? 'is-valid' : ''} ${isSubmitted && newPass != confPass ? 'is-invalid' : ''}`}
                                                    {...register('confirmPassword', { required: true, minLength: 6, onChange: ((event: any) => (isEditMode && !isNewUser ? setConfPass(event.target.value) : setConfPass(""))) })}
                                                />
                                                <div className="invalid-feedback">{errors.confirmPassword?.type === 'required' && "Confirmation password is required"}</div>
                                            </div>
                                        </div>
                                    </div> : null
                                }
                                {isNewUser ?
                                    <div className="password-well card card-body bg-light">
                                        <div className="row">

                                            <label className=" col-lg-3" htmlFor="newPassword">{t('NewPassword') as string}</label>
                                            <div className="col-lg-9">
                                                <input type="password" placeholder="Enter new password"
                                                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''} ${!errors.newPassword && isSubmitted ? 'is-valid' : ''}`}
                                                    {...register('newPassword', { required: true, minLength: 6, pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{6,20}$/, onChange: ((event: any) => (isNewUser ? setNewPass(event.target.value) : setNewPass(""))) })}
                                                />
                                                <div className="invalid-feedback">
                                                    {errors.newPassword?.type === 'required' && "New password is required (minimum of 6 characters)"}
                                                    {errors.newPassword?.type === 'pattern' && "New password must include 1 lowercase 1 uppercase 1 special character and 1 Numeric Value"}
                                                </div>
                                            </div>

                                        </div>
                                        <div className="row">
                                            <label className="col-lg-3" htmlFor="confirmPassword">{t('ConfirmPassword') as string}</label>
                                            <div className="col-form-label col-lg-9">
                                                <input type="password" placeholder="Enter Confirm password"
                                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''} ${!errors.confirmPassword && isSubmitted && newPass == confPass ? 'is-valid' : ''} ${isSubmitted && newPass != confPass ? 'is-invalid' : ''}`}
                                                    {...register('confirmPassword', { required: true, minLength: 6, onChange: ((event: any) => (isNewUser ? setConfPass(event.target.value) : setConfPass(""))) })}
                                                />
                                                <div className="invalid-feedback">{errors.confirmPassword?.type === 'required' && "Confirmation password is required"}</div>
                                            </div>
                                        </div>
                                    </div> : null
                                }
                            </div> : null
                        }
                    </div>
                    
                    
                </div> : null
            }

            <div className="row ">
                <div className="col-lg-12">
                    <hr className="separator-hr" />
                </div>
            </div>

            <div className="row">
                <label className="col-lg-2" htmlFor="roles-user-info">{t('Roles') as string}</label>
                <div className="col-lg-10">
                    {!isEditMode ? <p className="form-control-plaintext" ><span className="badge-pill badge-secondary">{users?.roles}</span></p> : null}
                    {isEditMode && !isNewUser ?
                        <Select
                            isMulti
                            placeholder="Select Roles"
                            defaultValue={users?.roles.map((role) => {
                                return {
                                    "label": role,
                                    "value": role
                                }
                            })}

                            styles={colourStyles}
                            theme={(theme) => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary25: '#f5faff',
                                    primary: '#ebf5ff',

                                },
                            })}
                            options={roles?.map((role) => {
                                return {
                                    "value": role.name,
                                    "label": role.name
                                }
                            })}
                            {...register('roles')}
                            onChange={handleChange}
                        /> : null
                    }
                    {isNewUser ?
                        <div>
                            <Select
                                isMulti
                                placeholder="Select Roles"
                                styles={colourStyles}
                                theme={(theme) => ({
                                    ...theme,
                                    colors: {
                                        ...theme.colors,
                                        primary25: '#f5faff',
                                        primary: '#ebf5ff',

                                    },
                                })}
                                options={roles?.map((role) => {
                                    return {
                                        "value": role.name,
                                        "label": role.name
                                    }
                                })}
                                {...register('roles')}
                                onChange={handleChange}
                            />
                        </div> : null
                    }
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <hr className="separator-hr" />
                </div>
            </div>

            <div className="row">
                <label className="col-lg-2" htmlFor="fullName">{t('FullName') as string}</label>
                <div className="col-lg-10">
                    {!isEditMode ? <p className="form-control-plaintext" >{users?.fullName}</p> : null}
                    {isEditMode && !isNewUser ?
                        <input type="text" {...register('fullName')} defaultValue={users?.fullName} placeholder="Enter Full Name." className="form-control" /> : null
                    }
                    {isNewUser ?
                        <input type="text" {...register('fullName')} className="form-control" placeholder="Enter Full Name." /> : null
                    }
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <hr className="separator-hr" />
                </div>
            </div>

            <div className="form-group row">
                <label className="col-lg-2" htmlFor="phoneNumber">{t('PhoneNumber') as string}</label>
                <div className="col-lg-10">
                    {!isEditMode ? <p className="form-control-plaintext" >{users?.phoneNumber}</p> : null}
                    {isEditMode && !isNewUser ?
                        <input type="text" {...register('phoneNumber')} defaultValue={users?.phoneNumber} placeholder="Enter Phone Number." className="form-control" /> : null
                    }
                    {isNewUser ?
                        <input type="text" {...register('phoneNumber')} className="form-control" placeholder="Enter Phone Number." /> : null
                    }
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <hr className="last-separator-hr" />
                </div>
            </div>

            <div className="form-group-row">
                <div className="col-sm-5">
                    <div className="float-left">
                        {isEditMode && !isNewUser ?
                            <div className="form-check user-enabled">
                                <input
                                    defaultChecked={users?.isEnabled}
                                    type="checkbox"
                                    {...register('isEnabled')}
                                    className="form-check-input"
                                />
                                <label className="form-check-label">{t('users.editor.Enabled') as string}</label>
                            </div>
                            :
                            null
                        }
                        {isNewUser ?
                            <div className="form-check user-enabled">
                                <input
                                    type="checkbox"
                                    {...register('isEnabled')}
                                    className="form-check-input"
                                />
                                <label className="form-check-label">{t('users.editor.Enabled') as string}</label>
                            </div>
                            :
                            null
                        }
                    </div>
                </div>

                <div className="col-sm-13">
                    <div className="float-right">
                        <br></br>
                        {!isEditMode ?
                            (<button type="button" onClick={edit} className="btn btn-outline-secondary"><FaEdit />&nbsp;{t('users.editor.Edit') as string}</button>)
                            :
                            (
                                <div>
                                    {!isEditMode && !isNewUser ?
                                        <button type="button" className="btn btn-danger" onClick={cancel} data-bs-dismiss="modal"><FaTimes />&nbsp;{t('users.editor.Cancel') as string}</button> : null
                                    }&nbsp;
                                    {isEditMode && !isNewUser ?
                                        <button type="button" className="btn btn-danger" onClick={cancel} data-bs-dismiss="modal"><FaTimes />&nbsp;{t('users.editor.Cancel') as string}</button> : null
                                    }&nbsp;
                                    {isNewUser && isEditMode ?
                                        <button type="button" className="btn btn-danger" onClick={cancel} data-bs-dismiss="modal"><FaTimes />&nbsp;{t('users.editor.Cancel') as string}</button> : null
                                    }&nbsp;
                                    <button type="submit" className="btn btn-primary" ><FaSave />&nbsp;{t('users.editor.Save') as string}</button>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </form>
    );
})
export default AddEdit 