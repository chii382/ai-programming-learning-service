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
import { Delete, Edit, Save } from '@mui/icons-material';
import { useSession } from 'next-auth/react';

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
  const currentUserId = session?.user?.id;
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // ダイアログ状態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('user');
  
  // 一括保存用の状態
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search]);
  
  // ページ範囲チェック用のuseEffect
  useEffect(() => {
    if (total > 0 && pageSize > 0) {
      const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);
      if (page > maxPage) {
        setPage(Math.max(0, maxPage));
      }
    }
  }, [total, pageSize]);

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

  const handleRoleChange = () => {
    if (!selectedUser) return;

    // 自分自身の権限変更を防ぐ
    if (selectedUser.id === currentUserId) {
      alert('自分自身の権限は変更できません');
      setRoleDialogOpen(false);
      setSelectedUser(null);
      return;
    }

    // 即座にAPIを呼ばず、ローカルステートに変更を保存
    setPendingRoleChanges((prev) => ({
      ...prev,
      [selectedUser.id]: newRole,
    }));

    // ユーザー一覧の表示も更新（即座に反映）
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUser.id ? { ...user, role: newRole } : user
      )
    );

    setRoleDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSaveAll = async () => {
    if (Object.keys(pendingRoleChanges).length === 0) {
      alert('保存する変更がありません');
      return;
    }

    // 自分自身の権限変更をチェック
    const selfChange = Object.keys(pendingRoleChanges).find(userId => userId === currentUserId);
    if (selfChange) {
      alert('自分自身の権限は変更できません');
      // 自分自身の変更を除外
      const filteredChanges = Object.fromEntries(
        Object.entries(pendingRoleChanges).filter(([userId]) => userId !== currentUserId)
      );
      setPendingRoleChanges(filteredChanges);
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/users/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changes: Object.entries(pendingRoleChanges).map(([userId, role]) => ({
            userId,
            role,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '権限の一括保存に失敗しました');
      }

      // 保存成功後、変更をクリアして一覧を再取得
      setPendingRoleChanges({});
      await fetchUsers();
      alert('権限の変更を保存しました');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    // 自分自身の削除を防ぐ
    if (selectedUser.id === currentUserId) {
      alert('自分自身を削除することはできません');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      return;
    }

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
        const errorData = await response.json();
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
        renderCell: (params) => {
          const user = params.row as User;
          const displayRole = pendingRoleChanges[user.id] || params.value;
          const hasPendingChange = pendingRoleChanges[user.id] !== undefined;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="body2"
                color={displayRole === 'admin' ? 'primary.main' : 'text.secondary'}
                sx={{
                  fontWeight: hasPendingChange ? 'bold' : 'normal',
                  textDecoration: hasPendingChange ? 'underline' : 'none',
                }}
              >
                {displayRole === 'admin' ? '管理者' : 'ユーザー'}
              </Typography>
              {hasPendingChange && (
                <Typography variant="caption" color="warning.main" sx={{ ml: 0.5 }}>
                  (未保存)
                </Typography>
              )}
            </Box>
          );
        },
      },
    {
      field: 'createdAt',
      headerName: '作成日時',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleString('ja-JP')}
        </Typography>
      ),
    },
      {
        field: 'actions',
        headerName: '操作',
        width: 220,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
          const user = params.row as User;
          const isCurrentUser = user.id === currentUserId;
          const isAdmin = user.role === 'admin';
          const adminCount = users.filter(u => u.role === 'admin').length;
          const isLastAdmin = isAdmin && adminCount === 1;
          const canEdit = !isCurrentUser && !isLastAdmin;
          const canDelete = !isCurrentUser && !isLastAdmin;

          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => {
                  setSelectedUser(user);
                  setNewRole(user.role);
                  setRoleDialogOpen(true);
                }}
                disabled={!canEdit}
                title={isCurrentUser ? '自分自身の権限は変更できません' : isLastAdmin ? '最後の管理者の権限は変更できません' : ''}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                権限変更
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  setSelectedUser(user);
                  setDeleteDialogOpen(true);
                }}
                disabled={!canDelete}
                title={isCurrentUser ? '自分自身を削除することはできません' : isLastAdmin ? '最後の管理者を削除することはできません' : ''}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                削除
              </Button>
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

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="検索（名前、メールアドレス）"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          検索
        </Button>
        {Object.keys(pendingRoleChanges).length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSaveAll}
            disabled={saving}
            sx={{ ml: 'auto' }}
          >
            {saving ? '保存中...' : `変更を保存 (${Object.keys(pendingRoleChanges).length}件)`}
          </Button>
        )}
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
            // ページ変更時にエラーが発生しないように、範囲チェック
            if (total > 0 && model.pageSize > 0) {
              const maxPage = Math.max(0, Math.ceil(total / model.pageSize) - 1);
              const validPage = Math.max(0, Math.min(model.page, maxPage));
              setPage(validPage);
              setPageSize(model.pageSize);
            } else {
              setPage(model.page);
              setPageSize(model.pageSize);
            }
          }}
          rowCount={total}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
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
            変更を確定
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
