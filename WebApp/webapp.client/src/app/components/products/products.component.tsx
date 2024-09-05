import { toast } from "react-toastify";
import { Role } from "../../models/role.model";
import { User } from "../../models/user.model";
import { AccountService } from "../../services/account.service";
import { useEffect, useState } from "react";
import { Permissions } from '../../models/permission.model';


function Products() {
    const accountService = new AccountService();
    const [data, setData] = useState<User[]>([]);
    let rows: User[] = [];
    let rowsCache: User[] = [];
    let allRoles: Role[] = [];
    const [forecasts, setForecasts] = useState<any[]>();

    useEffect(() => {
        loadData();
        populateWeatherData();
    }, []);
console.log(forecasts);
console.log(data)

    function loadData() {
        if (canViewRoles()) {
            accountService.getUsersAndRoles().subscribe((results:any) => onDataLoadSuccessful(results[0], results[1]), (error: any) => onDataLoadFailed(error));
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

    function onDataLoadFailed(error: any) {
        var errorMsg = error.response.data[""];
        toast.error("Load Error, Unable to retrieve users from the server", { toastId: "1", theme: 'colored' });
        toast.error(`${errorMsg}`, { toastId: "2", theme: 'colored' });
    }

    const canViewRoles = () => {
        return accountService.userHasPermission(Permissions.viewRoles);
    }

    async function populateWeatherData() {
        const response = await fetch('weatherforecast');
        const data = await response.json();
        setForecasts(data);
    }

    const contents = data === undefined
    ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
    : <table className="table table-striped" aria-labelledby="tabelLabel">
        <thead>
            <tr>
                <th>Date</th>
                <th>Temp. (C)</th>
                <th>Temp. (F)</th>
                <th>Summary</th>
            </tr>
        </thead>
        <tbody>
            {data.map(item =>
                <tr key={item.userName}>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.roles}</td>
                    <td>{item.phoneNumber}</td>
                </tr>
            )}
        </tbody>
    </table>;

    return (
     <>
            
            <div>
            <h1 id="tabelLabel">Weather forecast</h1>
            <p>This component demonstrates fetching data from the server.</p>
            {contents}
        </div>
                    
               
     </>
    )
  }
  
  export default Products