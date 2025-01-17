﻿using Core.Models.Account;
using System.Diagnostics.CodeAnalysis;

namespace WebApp.Server.ViewModels.Account
{
    public class PermissionVM
    {
        public string? Name { get; set; }
        public string? Value { get; set; }
        public string? GroupName { get; set; }
        public string? Description { get; set; }

        [return: NotNullIfNotNull(nameof(permission))]
        public static explicit operator PermissionVM?(ApplicationPermission? permission)
        {
            if (permission == null)
                return null;

            return new PermissionVM
            {
                Name = permission.Name,
                Value = permission.Value,
                GroupName = permission.GroupName,
                Description = permission.Description
            };
        }
    }
}
