import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  TextField,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
}));

const Settings = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    // Genel Ayarlar
    theme: 'light',
    language: 'tr',
    mapType: 'street',
    defaultZoom: 7,
    
    // Bildirim Ayarları
    emailNotifications: true,
    emailAddress: '',
    
    // Profil Ayarları
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordVisibilityToggle = () => {
    setSettings(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon /> Ayarlar
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab 
          icon={<DarkModeIcon />} 
          label="Genel Ayarlar" 
          sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
        />
        <Tab 
          icon={<NotificationsIcon />} 
          label="Bildirim Ayarları" 
          sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
        />
        <Tab 
          icon={<PersonIcon />} 
          label="Profil" 
          sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
        />
      </Tabs>

      {activeTab === 0 && (
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Genel Ayarlar
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography gutterBottom>Tema</Typography>
            <Select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <MenuItem value="light">Açık Mod</MenuItem>
              <MenuItem value="dark">Koyu Mod</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography gutterBottom>Dil</Typography>
            <Select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <MenuItem value="tr">Türkçe</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <Typography gutterBottom>Harita Tipi</Typography>
            <Select
              value={settings.mapType}
              onChange={(e) => handleSettingChange('mapType', e.target.value)}
            >
              <MenuItem value="street">Street Map</MenuItem>
              <MenuItem value="satellite">Satellite</MenuItem>
              <MenuItem value="terrain">Terrain</MenuItem>
            </Select>
          </FormControl>

          <Typography gutterBottom>Varsayılan Yakınlaştırma Seviyesi</Typography>
          <Slider
            value={settings.defaultZoom}
            onChange={(e, newValue) => handleSettingChange('defaultZoom', newValue)}
            min={1}
            max={18}
            valueLabelDisplay="auto"
            marks
            sx={{ mb: 3 }}
          />
        </StyledPaper>
      )}

      {activeTab === 1 && (
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Bildirim Ayarları
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
            }
            label="E-posta Bildirimleri"
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="E-posta Adresi"
              type="email"
              value={settings.emailAddress}
              onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
              disabled={!settings.emailNotifications}
            />
          </FormControl>
        </StyledPaper>
      )}

      {activeTab === 2 && (
        <StyledPaper>
          <Typography variant="h6" gutterBottom>
            Profil Ayarları
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="Mevcut Şifre"
              type={settings.showPassword ? 'text' : 'password'}
              value={settings.currentPassword}
              onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handlePasswordVisibilityToggle}
                      edge="end"
                    >
                      {settings.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="Yeni Şifre"
              type={settings.showPassword ? 'text' : 'password'}
              value={settings.newPassword}
              onChange={(e) => handleSettingChange('newPassword', e.target.value)}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              label="Yeni Şifre (Tekrar)"
              type={settings.showPassword ? 'text' : 'password'}
              value={settings.confirmPassword}
              onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
            />
          </FormControl>
        </StyledPaper>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Ayarları Kaydet
        </Button>
      </Box>
    </Container>
  );
};

export default Settings; 