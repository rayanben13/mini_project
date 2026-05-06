import { Button } from '@/components/ui/button';
import useUserStore from '@/Store/user/userStore';
import { Loader2, UserMinus, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// أضفنا initialFollowing هنا
function FollowButton({ id_user, status, onActionSuccess }: { id_user: number, status: string, onActionSuccess: (following: boolean) => void }) {
    const router = useRouter()
    const { addFollow, removeFollow } = useUserStore()
    const initialFollowing = status === "FOLLOWING" ? true : false

    // نضع القيمة المبدئية القادمة من السيرفر/الأب
    const [following, setFollowing] = useState(initialFollowing)
    const [loading, setLoading] = useState(false)

    // لضمان تحديث الزر إذا تغيرت البيانات القادمة من الخارج
    useEffect(() => {
        setFollowing(initialFollowing)
    }, [initialFollowing])

    const toggleFollow = async () => {
        setLoading(true)
        try {
            if (following) {
                const res = await removeFollow(id_user)
                if (res.success) {
                    setFollowing(false)
                    toast.success('Unfollowed successfully')
                    router.refresh() // لتحديث العدادات في الصفحة
                    onActionSuccess(false)
                }
            } else {
                const res = await addFollow(id_user)
                if (res.success) {
                    setFollowing(true)
                    toast.success('Followed successfully')
                    router.refresh() // لتحديث العدادات في الصفحة
                    onActionSuccess(true)
                }
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={toggleFollow}
            disabled={loading}
            variant={following ? "outline" : "default"}
            className={`h-12 md:h-14 px-8 font-bold rounded-2xl transition-all duration-300 ${!following
                ? "bg-[#0975e6] hover:bg-[#0866c9] text-white shadow-lg shadow-[#0975e6]/20"
                : "border-slate-200 dark:border-slate-700"
                }`}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : following ? (
                <>
                    <UserMinus className="w-5 h-5 mr-2" />
                    Unfollow
                </>
            ) : (
                <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Follow
                </>
            )}
        </Button>
    )
}

export default FollowButton