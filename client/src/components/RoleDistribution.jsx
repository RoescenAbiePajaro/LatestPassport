import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Shield, User } from 'lucide-react';

const RoleDistribution = ({ users = [] }) => {
  // Calculate role distribution
  const roleData = useMemo(() => {
    const adminCount = users.filter(user => user.isAdmin).length;
    const staffCount = users.filter(user => !user.isAdmin).length;
    
    return [
      { name: 'Admin', value: adminCount, color: '#8b5cf6' },
      { name: 'Staff', value: staffCount, color: '#3b82f6' }
    ];
  }, [users]);

  // Calculate percentages
  const totalUsers = users.length;
  const adminPercentage = totalUsers > 0 ? Math.round((roleData[0].value / totalUsers) * 100) : 0;
  const staffPercentage = totalUsers > 0 ? Math.round((roleData[1].value / totalUsers) * 100) : 0;

  if (users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Users className="mx-auto h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={roleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={65}
              innerRadius={45}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={5}
            >
              {roleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value} users`, name]}
              contentStyle={{
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                padding: '10px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center mt-2 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <div>
            <p className="text-xs font-medium dark:text-white">{adminPercentage}%</p>
            <div className="flex items-center text-xs text-gray-500">
              <Shield className="w-3 h-3 mr-1" />
              <span>Admin ({roleData[0].value})</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <div>
            <p className="text-xs font-medium dark:text-white">{staffPercentage}%</p>
            <div className="flex items-center text-xs text-gray-500">
              <User className="w-3 h-3 mr-1" />
              <span>Staff ({roleData[1].value})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDistribution;