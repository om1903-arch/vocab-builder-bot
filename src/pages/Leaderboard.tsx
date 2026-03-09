import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, UserPlus, Search, Check, X, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  xp: number;
  level: string;
};

type Friendship = {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  friend_profile?: Profile;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [globalProfiles, setGlobalProfiles] = useState<Profile[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<Profile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchGlobalLeaderboard(),
      fetchFriends(),
      fetchRequests()
    ]);
    setLoading(false);
  };

  const fetchGlobalLeaderboard = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, xp, level')
      .order('xp', { ascending: false })
      .limit(50);

    if (!error && data) {
      setGlobalProfiles(data);
    }
  };

  const fetchFriends = async () => {
    if (!user) return;
    
    // Get all accepted friendships
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (error) {
      console.error(error);
      return;
    }

    const friendUserIds = friendships.map(f => 
      f.user_id === user.id ? f.friend_id : f.user_id
    );

    // Also include the current user
    friendUserIds.push(user.id);

    if (friendUserIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, xp, level')
        .in('user_id', friendUserIds)
        .order('xp', { ascending: false });

      if (!profilesError && profiles) {
        setFriendsProfiles(profiles);
      }
    }
  };

  const fetchRequests = async () => {
    if (!user) return;

    // Received requests
    const { data: received, error: receivedError } = await supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (!receivedError && received) {
      // Fetch profiles for these requests
      const senderIds = received.map(r => r.user_id);
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', senderIds);
        
        const requestsWithProfiles = received.map(r => ({
          ...r,
          friend_profile: profiles?.find(p => p.user_id === r.user_id) as Profile
        }));
        setPendingRequests(requestsWithProfiles);
      } else {
        setPendingRequests([]);
      }
    }

    // Sent requests
    const { data: sent, error: sentError } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (!sentError && sent) {
      const receiverIds = sent.map(r => r.friend_id);
      if (receiverIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', receiverIds);
        
        const requestsWithProfiles = sent.map(r => ({
          ...r,
          friend_profile: profiles?.find(p => p.user_id === r.friend_id) as Profile
        }));
        setSentRequests(requestsWithProfiles);
      } else {
        setSentRequests([]);
      }
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    
    // Simple ilike search on display_name
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, xp, level')
      .ilike('display_name', `%${searchQuery}%`)
      .neq('user_id', user.id)
      .limit(10);

    if (!error && data) {
      setSearchResults(data);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('تم إرسال طلب مسبقاً أو أنتم أصدقاء بالفعل');
      } else {
        toast.error('حدث خطأ أثناء إرسال الطلب');
      }
    } else {
      toast.success('تم إرسال طلب الصداقة');
      fetchRequests();
      setSearchResults(searchResults.filter(p => p.user_id !== friendId));
    }
  };

  const handleRequest = async (requestId: string, action: 'accepted' | 'rejected') => {
    if (action === 'accepted') {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);
        
      if (!error) {
        toast.success('تم قبول طلب الصداقة');
        fetchData();
      } else {
        toast.error('حدث خطأ');
      }
    } else {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);
        
      if (!error) {
        toast.success('تم رفض طلب الصداقة');
        fetchRequests();
      } else {
        toast.error('حدث خطأ');
      }
    }
  };

  const renderLeaderboardList = (profiles: Profile[]) => {
    return (
      <div className="space-y-4 mt-6">
        {profiles.map((profile, index) => {
          const isCurrentUser = profile.user_id === user?.id;
          return (
            <div 
              key={profile.id} 
              className={`flex items-center gap-4 p-4 rounded-xl border ${
                isCurrentUser ? 'bg-primary/10 border-primary/20' : 'glass-card'
              }`}
            >
              <div className="flex items-center justify-center w-8 font-bold text-lg text-muted-foreground">
                {index === 0 ? <Trophy className="h-6 w-6 text-yellow-500" /> :
                 index === 1 ? <Medal className="h-6 w-6 text-gray-400" /> :
                 index === 2 ? <Medal className="h-6 w-6 text-amber-600" /> :
                 `#${index + 1}`}
              </div>
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {profile.display_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-bold flex items-center gap-2">
                  {profile.display_name || 'مستخدم'}
                  {isCurrentUser && <Badge variant="secondary" className="text-xs">أنت</Badge>}
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  المستوى: {profile.level}
                </div>
              </div>
              <div className="text-left font-bold text-primary">
                {profile.xp} XP
              </div>
            </div>
          );
        })}
        {profiles.length === 0 && !loading && (
          <div className="text-center p-8 text-muted-foreground glass-card rounded-xl">
            لا يوجد بيانات حالياً
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">لوحة الصدارة</h1>
            <p className="text-muted-foreground">تنافس مع أصدقائك واللاعبين الآخرين</p>
          </div>
        </div>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card">
            <TabsTrigger value="global">العالمي</TabsTrigger>
            <TabsTrigger value="friends">الأصدقاء</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card className="glass-card border-none shadow-none mt-4">
              <CardHeader>
                <CardTitle>أفضل اللاعبين</CardTitle>
                <CardDescription>أعلى 50 لاعب في التطبيق بناءً على نقاط الخبرة</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  renderLeaderboardList(globalProfiles)
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-card border-none shadow-none">
                  <CardHeader>
                    <CardTitle>ترتيب الأصدقاء</CardTitle>
                    <CardDescription>قارن نقاطك مع أصدقائك</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center p-12">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      renderLeaderboardList(friendsProfiles)
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass-card border-none shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      إضافة أصدقاء
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="ابحث بالاسم..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                        className="bg-background/50 backdrop-blur-sm"
                      />
                      <Button onClick={searchUsers} size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {searchResults.map(profile => (
                          <div key={profile.id} className="flex items-center justify-between p-2 rounded-lg border bg-background/30">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {profile.display_name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium truncate w-24">
                                {profile.display_name || 'مستخدم'}
                              </span>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => sendFriendRequest(profile.user_id)}>
                              إضافة
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {pendingRequests.length > 0 && (
                  <Card className="glass-card border-none shadow-none border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        طلبات الصداقة ({pendingRequests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pendingRequests.map(req => (
                        <div key={req.id} className="flex flex-col gap-2 p-3 rounded-lg border bg-primary/5">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs text-primary">
                                {req.friend_profile?.display_name?.substring(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold">
                              {req.friend_profile?.display_name || 'مستخدم'}
                            </span>
                          </div>
                          <div className="flex gap-2 w-full mt-1">
                            <Button size="sm" className="flex-1" onClick={() => handleRequest(req.id, 'accepted')}>
                              <Check className="h-4 w-4 ml-1" /> قبول
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleRequest(req.id, 'rejected')}>
                              <X className="h-4 w-4 ml-1" /> رفض
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {sentRequests.length > 0 && (
                  <Card className="glass-card border-none shadow-none opacity-70">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        طلبات مرسلة ({sentRequests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {sentRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-2 rounded-lg border bg-background/20">
                          <span className="text-sm">
                            {req.friend_profile?.display_name || 'مستخدم'}
                          </span>
                          <span className="text-xs text-muted-foreground">قيد الانتظار</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Leaderboard;