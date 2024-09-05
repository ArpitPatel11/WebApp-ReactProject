import './users-management-component.scss';
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { AccountService } from '../../services/account.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { Permissions } from '../../models/permission.model';
import { UserEdit } from '../../models/user-edit.model';
import { AddEdit } from '../controls/user-info-form';
import { FaUserPlus, FaUserCircle, FaPlusCircle, FaPlus } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const UsersManagementComponent = () => {
    const accountService = new AccountService();
    const [data, setData] = useState<User[]>([]);
    const [isModel, setModelShow] = useState(true);
    const [iseditiUserName, setEditingUserName] = useState(false);
    const childRef = useRef<any | undefined>();
    const grid = React.useRef(null);
    const alertify: any = ('../../assets/scripts/alertify.js');
    const [editUserName, setEditUserName] = useState("");
    let rows: User[] = [];
    let rowsCache: User[] = [];
    let allRoles: Role[] = [];

    useEffect(() => {
        loadData();
    }, []);

    const gridColumns = [
        { title: '#', field: 'index', show: true, filter: 'numeric', minWidth: 90},
        { title: 'Title', field: 'jobTitle', show: true, filter: 'text', minWidth: 150 },
        { title: 'User Name', field: 'userName', show: true, filter: 'text', minWidth: 150 },
        { title: 'Full Name', field: 'fullName', show: true, filter: 'text', minWidth: 200 },
        { title: 'Email', field: 'email', show: true, filter: 'text', minWidth: 200 },
        { title: 'Roles', field: 'roles', show: true, filter: 'text', minWidth: 200 },
        { title: 'Phone Number', field: 'phoneNumber', show: true, filter: 'numeric', minWidth: 200 }    ];

    const [stateColumns, setStateColumns] = useState(gridColumns);

    const onColumnsSubmit = (columnsState: any) => {

        setStateColumns(columnsState);
        console.log(stateColumns)
    };

    function changesSavedCallback() {
        document.getElementById("cancleBT")?.click();
        loadData();
    }

    function loadData() {
        if (canViewRoles()) {
            accountService.getUsersAndRoles().subscribe(results => onDataLoadSuccessful(results[0], results[1]), (error: any) => onDataLoadFailed(error));
        } else {
            accountService.getUsers().subscribe((users: User[]) => onDataLoadSuccessful(users, accountService.currentUser.roles.map(x => new Role(x, x, []))), (error: any) => onDataLoadFailed(error));
        }
        
    }

    function onDataLoadSuccessful(user: User[], roles: Role[]) {
       
        user.forEach((user, index) => {
            (user as any).index = index + 1;
        });

        rowsCache = [...user];
        rows = user;

        allRoles = roles;
        setData(user);
    }

    function enterInsert() {
        childRef.current.newUser();
        setModelShow(true);
        setEditingUserName(false);
    }

    function enterEdit(row: UserEdit) {
        if (childRef.current) {
            childRef.current.editUser(row);
        }

        setModelShow(true);
        setEditingUserName(true);
        setEditUserName(row.userName);
    }

    const remove = (row: UserEdit) => {
        console.log("Deleting");
        remove1(row);
    }

    function remove1(row: UserEdit) {
        alertify.confirm('Are you sure you want to delete the \"' + row.userName + '\" role?', function (e: any) { if (e) { (deleteUserHelper(row)); } });
    }

    function onDataLoadFailed(error: any) {
        var errorMsg = error.response.data[""];
        toast.error("Load Error, Unable to retrieve users from the server", { toastId: "1", theme: 'colored' });
        toast.error(`${errorMsg}`, { toastId: "2", theme: 'colored' });
    }

    function deleteUserHelper(row: UserEdit) {
        // accountService.deleteUser(row)
        //     .then((results: any) => {
        //         rowsCache = rowsCache.filter(item => item !== row);
        //         rows = rows.filter(item => item !== row);
        //         loadData();
        //     },
        //         (error: any) => {
                    
        //         });
    }

    const searchItems = (searchValue: string) => {
        if (searchValue) {
            var filter = data?.filter((item) => item.userName.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
            setData(filter);
        } else if (searchValue == "") {
            loadData();
        }
    }

    const canViewRoles = () => {
        return accountService.userHasPermission(Permissions.viewRoles);
    }

    const canManageUsers = () => {
        return accountService.userHasPermission(Permissions.manageUsers);
    }

    const { t } = useTranslation();

    const contents = data === undefined
    ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
    : <table className="colored-header sm table table-striped table-hover" aria-labelledby="tabelLabel">
        <thead>
            <tr>
                <th>UserName</th>
                <th>FullName</th>
                <th>Email</th>
                <th>Roles</th>
                <th>PhoneNumber</th>
            </tr>
        </thead>
        <tbody>
            {data.map(item =>
                <tr key={item.id}>
                    <td>{item.userName}</td>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.roles}</td>
                    <td>{item.phoneNumber}</td>
                </tr>
            )}
        </tbody>
    </table>;

    return (
        <div className="row control-box">
            <div className="colored-header sm table table-striped table-hover">
            {contents}
                </div>
         

            {isModel ?
                <div className="modal" id="myModal">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                {!iseditiUserName ?
                                    <h4 className="modal-title"><FaUserPlus />&nbsp;{t('NewUser') as string}</h4> :
                                    <h4 className="modal-title"><FaUserCircle />&nbsp;{t('Edit User') as string} "{editUserName}" </h4>
                                }
                                <button id="cancleBT" type="button" className="close" onClick={() => childRef.current.cancel()} data-bs-dismiss="modal">&times;</button>
                            </div>

                            <div className="modal-body">
                                <AddEdit ref={childRef} changesSavedCallback={changesSavedCallback} />
                            </div>
                        </div>
                    </div>
                </div> : null}
        </div>
    );
}
export default UsersManagementComponent