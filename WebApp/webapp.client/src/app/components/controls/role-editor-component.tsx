import * as React from 'react';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { AccountService } from '../../services/account.service';
import { FaShieldAlt, FaTimes } from 'react-icons/fa';
import './role-editor-component.scss';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export const RoleEditorComponent = forwardRef((props: { changesSavedCallback?: any }, ref) => {
    let defaultPermissions: any[] = [];
    let permissionValues: any;
    let getSelectedPermission: any;
    let eachPermission: any;
    let toastId: any;
    const accountService = new AccountService();
    const [allPermissions, setAllPermissions] = useState<any[]>();
    const [permissions, setPermissions] = useState<Permission[]>();
    const [isNewRole, setNewRole] = useState(false);
    const [isPending, startTransition] = React.useTransition();
    const { register, setValue, handleSubmit, reset, formState: { errors, isSubmitted, isValid } } = useForm<Role>();
    const [roles, setRoles] = useState<Role | null>();
    const { t } = useTranslation();

    const groupBy = (array: any[], key: any) =>
        array.reduce((result, { [key]: k, ...rest }) => {
            (result[k] = result[k] || []).push(rest);
            return result;
        }, {});

    const groupDataBy = (array: any[], key: any) =>
        Object.entries(groupBy(array, key)).map(([key, values]) => ({ key, values }))

    const loadData = () => {
        accountService.getRolesAndPermissions().subscribe((results: any) => {
            setPermissions(results[1])
            const gropByName = groupDataBy(results[1], 'groupName');
            setAllPermissions(gropByName);
        }, (error: any) => { console.log(error); });
    }

    useImperativeHandle(ref, () => ({
        edit: (role: Role) => {
            setRoles(role);
            setNewRole(false);
            setValue("id", role.id);
            setValue("name", role.name);
            setValue("description", role.description);
            permissionValues = role.permissions.map((i: any) => i.value);
            defaultPermissions?.push(permissionValues);
            setValue("permissions", defaultPermissions[0]);
            startTransition(() => {
                var checkedBoxes = role.permissions.map((p: any) => p.value);
                for (let checkedCheckBoxes of checkedBoxes) {
                    var eachBox = document.getElementById(checkedCheckBoxes) as HTMLInputElement | null;
                    if (eachBox != null) {
                        eachBox.checked = true;
                    }
                }
            })
        },
        newRole: () => {
            reset();
            setRoles(null);
            setValue("permissions", defaultPermissions);
            setNewRole(true);
        },
        cancel() {
            setNewRole(false);
            reset();
        },
    }))

    const cancle = () => {
        setNewRole(false);
        reset();
        toast.error("Cancled, Operation cancelled by user", { toastId: "1", theme: 'colored'})
    }

    const save = (data: any) => {
        //toastId = toast("Saving Role....", { autoClose: false,theme: 'colored' });
        getSelectedPermission = data.permissions;

        for (let p of getSelectedPermission) {
            eachPermission = permissions?.filter((i: any) => i.value === p);
            defaultPermissions?.push(eachPermission[0]);
        }

        data.permissions = defaultPermissions;
        if (isNewRole) {
            accountService.newRole(data).subscribe(roleRes => saveSuccessHelper(roleRes[0]), error => saveFailedHelper(error));
        } else {
            // accountService.updateRole(data).then((response: any) => saveSuccessHelper(), (error: any) => saveFailedHelper(error));
        }
    }

    const saveSuccessHelper = (role?: any) => {
        props.changesSavedCallback();
        if (isNewRole) {
            toast.success(`Success Role ${role.name} was created successfully`, { toastId: "1", theme: 'colored' });
        }
        
    }

    const saveFailedHelper = (error: any) => {
        var errorMsg = error.response.data[""];
        toast.error("Save Error, The below errors occured whilst saving your changes", { toastId: "1", theme: 'colored' });
        toast.error(`${errorMsg}`, { toastId: "2", theme: 'colored' });
    }

    const selectAll = () => {
        let checkedBoxes: any;
        checkedBoxes = permissions?.map((p: any) => p.value);
        setValue("permissions", checkedBoxes);
        for (let checkedCheckBoxes of checkedBoxes) {
            var eachBox = document.getElementById(checkedCheckBoxes) as HTMLInputElement | null;
            if (eachBox != null) {
                eachBox.checked = true;
            }
        }

    }

    const selectNone = () => {
        let checkedBoxes: any;
        checkedBoxes = permissions?.map((p: any) => p.value);
        setValue("permissions", defaultPermissions);
        for (let checkedCheckBoxes of checkedBoxes) {
            var eachBox = document.getElementById(checkedCheckBoxes) as HTMLInputElement | null;
            if (eachBox != null) {
                eachBox.checked = false;
            }
        }
    }


    useEffect(() => {
        loadData();
    }, []);

    return (
        <form onSubmit={handleSubmit(save)}>
            <div className="row">
                <div className="col-sm-5">
                    <div className="row">
                        <label className="col-form-label col-md-3" htmlFor="name">{t('roles.editor.Name') as string}</label>
                        <div className="col-md-9">
                            <input
                                defaultValue={roles?.name}
                                type="text" {...register('name', { required: true, minLength: 2, maxLength: 200 })}
                                placeholder="Enter Role Name."
                                className={`form-control ${errors.name ? 'is-invalid' : ''} ${!errors.name && isSubmitted ? 'is-valid' : ''}`}
                            />
                            <div className="invalid-feedback">
                                {errors.name?.type === 'required' && "Role name is required (minimum of 2 and maximum of 200 characters)"}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-7">
                    <div className="row">
                        <label className="col-form-label col-md-3" htmlFor="description">{t('roles.editor.Description') as string}</label>
                        <div className="col-md-9">
                            <input
                                type="text" {...register("description")}
                                defaultValue={roles?.description}
                                placeholder="Enter Role Description."
                                className="form-control"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <hr className="edit-separator-hr" />
                </div>
            </div>

            <div className="row">
                <div className="bg-light card card-body col-sm-12 permissionsRow well-sm">
                    <div className="row">
                        <div className="d-flex permissionsColumn">
                            {allPermissions?.map(({ key, values }: any, methodIndex: React.Key | null | undefined) => {
                                return (
                                    <div key={methodIndex}>
                                        <label className="col-form-label col-md-6 group-name" htmlFor="checkboxes" >{key}</label>
                                        <div className="col-10 col-md-6 d-inline-flex row">
                                            {values.map(({ name, value }: any, unitIndex: any) => {
                                                return (
                                                    <div className="form-check" key={unitIndex}>
                                                        <label className="form-check-label">
                                                            <input id={value}
                                                                type="checkbox" className="form-check-input"
                                                                {...register('permissions')}
                                                                value={value}
                                                            />
                                                            {name}
                                                        </label>
                                                    </div>
                                                )
                                            }
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <hr className="edit-last-separator-hr" />
                </div>
            </div>

            <div className="form-group row">
                <div className="col-sm-5">
                    <div className="float-left">
                        <a className="btn btn-link" onClick={selectAll}>{t('roles.editor.SelectAll') as string}</a>
                        <a className="btn btn-link" onClick={selectNone}>{t('roles.editor.SelectNone') as string}</a>
                    </div>
                </div>
                <div className="col-sm-7">
                    <div className="float-right">
                        <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={cancle}><FaTimes />&nbsp;{t('roles.editor.Cancel') as string}</button>
                        &nbsp;
                        <button type="submit" className="btn btn-primary" ><FaShieldAlt />&nbsp;{t('roles.editor.Save') as string}</button>
                    </div>
                </div >
            </div >
        </form>
    )
})

export default RoleEditorComponent