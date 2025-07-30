import React from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline,
  Drawer, 
  IconButton, 
  List, 
  ListItem,
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography
} from '@mui/material';
import { 
  Dashboard, 
  AccountBalance, 
  SwapHoriz, 
  Visibility,
  Person
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Portfolios', icon: <AccountBalance />, path: '/portfolios' },
    { text: 'Transactions', icon: <SwapHoriz />, path: '/transactions' },
    { text: 'Watchlist', icon: <Visibility />, path: '/watchlist' },
  ];

  const drawer = (
    <div>

      <div className="drawer-separator"></div>
      <List className="nav-list">
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding className="nav-item">
              <ListItemButton 
                component={Link} 
                to={item.path}
                className={isSelected ? "nav-item-selected" : ""}
              >
                <ListItemIcon 
                  className={isSelected ? "nav-item-icon nav-item-icon-selected" : "nav-item-icon"}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  className="nav-item-text" 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box className="main-layout">
      <CssBaseline />
      <AppBar position="fixed" className="app-header" elevation={0}>
        <Toolbar>
          <div className="app-title">
            <Typography variant="h6" noWrap component="div">
              Portfolio Manager
            </Typography>
          </div>
          <IconButton className="header-icon">
            <Person />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        className="drawer"
        classes={{
          paper: "drawer-paper"
        }}
        open
      >
        {drawer}
      </Drawer>
      
      <Box component="main" className="main-content">
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;