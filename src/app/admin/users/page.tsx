'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import { Delete, Edit } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { Tooltip } from '@mui/material';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // 現在のログインユーザーIDを取得
  const currentUserId = session?.user?.id;

  // ダイアログ状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('user');

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        pageSize: pageSize.toString(),
        sortField: 'createdAt',
        sortOrder: 'desc',
      });
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        throw new Error('ユーザー一覧の取得に失敗しました');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '権限の変更に失敗しました');
      }

      setRoleDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'ユーザーの削除に失敗しました');
      }

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: '名前', width: 200 },
    { field: 'email', headerName: 'メールアドレス', width: 250 },
    {
      field: 'role',
      headerName: '権限',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color={params.value === 'admin' ? 'primary.main' : 'text.secondary'}>
          {params.value === 'admin' ? '管理者' : 'ユーザー'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: '作成日時',
      width: 180,
      renderCell: (params) => {
        try {
          const date = params.value ? new Date(params.value) : null;
          if (!date || isNaN(date.getTime())) {
            return <Typography variant="body2" color="error">日付エラー</Typography>;
          }
          return (
            <Typography variant="body2">
              {date.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          );
        } catch (error) {
          return <Typography variant="body2" color="error">日付エラー</Typography>;
        }
      },
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const isCurrentUser = currentUserId === params.row.id;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isCurrentUser ? '自分自身の権限は変更できません' : ''}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => {
                    setSelectedUser(params.row as User);
                    setNewRole(params.row.role);
                    setRoleDialogOpen(true);
                  }}
                  disabled={isCurrentUser}
                  sx={{
                    fontSize: '0.75rem',
                    px: 1,
                    py: 0.5,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  権限変更
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={isCurrentUser ? '自分自身は削除できません' : ''}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => {
                    setSelectedUser(params.row as User);
                    setDeleteDialogOpen(true);
                  }}
                  disabled={isCurrentUser}
                  sx={{
                    fontSize: '0.75rem',
                    px: 1,
                    py: 0.5,
                    minWidth: 'auto',
                  }}
                >
                  削除
                </Button>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        ユーザー管理
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="検索（名前、メールアドレス）"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          検索
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          rowCount={total}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Box>

      {/* 権限変更ダイアログ */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>権限変更</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedUser?.name} ({selectedUser?.email}) の権限を変更しますか？
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>権限</InputLabel>
            <Select
              value={newRole}
              label="権限"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="user">ユーザー</MenuItem>
              <MenuItem value="admin">管理者</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleRoleChange} variant="contained">
            変更
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>ユーザー削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.name} ({selectedUser?.email}) を削除しますか？
            この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
