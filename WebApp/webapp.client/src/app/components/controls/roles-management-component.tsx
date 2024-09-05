
import { useEffect, useRef, useState } from 'react';
import { Permission } from '../../models/permission.model';
import { Role } from '../../models/role.model';
import { AccountService } from '../../services/account.service';
import './roles-management-component.scss';
import { FaShieldAlt, FaPlusCircle } from 'react-icons/fa';
import { RoleEditorComponent } from './role-editor-component';
import React from 'react';
import { useTranslation } from 'react-i18next';

const RolesManagementComponent = () => {
    const accountService = new AccountService();
    let rows: Role[] = [];
    let rowsCache: Role[] = [];
    let allPermissions: Permission[] = [];
    const [data, setData] = useState<Role[]>([])
    const [iseditiRoleName, seteditingRoleName] = useState(false);
    const [isModel, setModelShow] = useState(true);
    const childRef = useRef<any | undefined>();
    const [searchValue, setSeachValue] = useState("");
    const alertify: any = require('../../assets/scripts/alertify.js');
    const [editRoleName, setEditRoleName] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const gridColumns = [
        { title: '#', field: 'index', show: true, filter: 'numeric' },
        { title: 'Name', field: 'name', show: true, filter: 'text', filterable: true },
        { title: 'Description', field: 'description', show: true, filter: 'text' },
        { title: 'Users', field: 'usersCount', show: true, filter: 'text' }];

    const [stateColumns, setStateColumns] = useState(gridColumns);

    const onColumnsSubmit = (columnsState: any) => {

        setStateColumns(columnsState);
        console.log(stateColumns)
    };

    function changesSavedCallback() {
        document.getElementById("rcancleBT")?.click();
        loadData();
    }

    function loadData() {
        accountService.getRolesAndPermissions()
            .subscribe((results: any) => {
                const roles = results[0];
                const permissions = results[1];

                roles.forEach((role: any, index: number) => {
                    (role as any).index = index + 1;
                });

                rowsCache = [...roles];
                setData(roles);

                allPermissions = permissions;
                //setResult(roles);
            },
                error => {
                    console.log(error);
                });
    }

    function editRole(row: Role) {
        if (childRef.current) {
            childRef.current.edit(row, allPermissions);
        }
        setModelShow(true);
        seteditingRoleName(true);
        setEditRoleName(row.name);
    }

    function newRole() {
        if (childRef.current) {
            childRef.current.newRole(allPermissions);
        }
        setModelShow(true);
        seteditingRoleName(false);
    }

    const searchRole = (searchValue: string) => {
        if (searchValue) {
            var filter = data?.filter((item) => item.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
            setData(filter);
        } else if (searchValue == "") {
            loadData();
        }
    }

    function deleteRole(row: Role) {
        alertify.confirm('Are you sure you want to delete the \"' + row.name + '\" role?', function (e: any) { if (e) { (deleteRoleHelper(row)); }});
    }

    function deleteRoleHelper(row: Role) {
        // accountService.deleteRole(row)
        //     .then((results: any) => {
        //         rowsCache = rowsCache.filter(item => item !== row);
        //         rows = rows.filter(item => item !== row);
        //         loadData();
        //     },
        //     (error: any) => {

        //     });
    }

    const { t } = useTranslation();

    const contents = data === undefined
    ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
    : <table className="colored-header sm table table-striped table-hover" aria-labelledby="tabelLabel">
        <thead>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Users</th>
            </tr>
        </thead>
        <tbody>
            {data.map(item =>
                <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.usersCount}</td>
                </tr>
            )}
        </tbody>
    </table>;

    return (
        <div>
            <div className="row control-box">
                <div className="colored-header sm table table-striped table-hover">
                    {contents}
                </ div>
            </div>

            {isModel ?
                < div className="modal" id="myModalrole">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                {!iseditiRoleName ?
                                    <h4 className="modal-title"><FaShieldAlt />{t('roles.management.NewRole') as string}</h4> :
                                    <h4 className="modal-title"><FaShieldAlt /> {t('Edit Role') as string} "{editRoleName}"</h4>
                                }
                                <button id="rcancleBT" type="button" className="close" onClick={() => childRef.current.cancel()} data-bs-dismiss="modal">&times;</button>
                            </div>
                            <div className="modal-body">
                                <RoleEditorComponent ref={childRef} changesSavedCallback={changesSavedCallback}/>
                            </div>
                        </div>
                    </div>
                </div> : null}
        </div>
    );
}

export default RolesManagementComponent