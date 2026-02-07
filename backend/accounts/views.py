from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import UserProfile


@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    username = request.POST.get("username")
    password = request.POST.get("password")
    age = request.POST.get("age")
    goal = request.POST.get("goal")

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password
    )

    UserProfile.objects.create(
        user=user,
        age=age,
        goal=goal,
        approved=False
    )

    return JsonResponse(
        {"message": "User registered successfully. Waiting for admin approval."},
        status=201
    )

    # Create UserProfile
    UserProfile.objects.create(
        user=user,
        age=age,
        height=height,
        weight=weight,
        goal=goal,
        gym_type=gym_type,
        approved=False
    )

    return JsonResponse({
        "message": "User registered successfully. Waiting for admin approval."
    }, status=201)
from django.http import JsonResponse
from accounts.models import UserProfile


def user_dashboard(request):
    username = request.GET.get("username")

    if not username:
        return JsonResponse({"error": "Username required"}, status=400)

    try:
        profile = UserProfile.objects.get(user__username=username)

        if not profile.approved:
            return JsonResponse({
                "approved": False,
                "message": "Waiting for admin approval"
            })

        return JsonResponse({
            "approved": True,
            "username": profile.user.username,
            "goal": profile.goal,
            # 🔑 THIS IS THE FIX
            "trainer": profile.trainer.trainer_id if profile.trainer else None,
            "message": "Approved"
        })

    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
from django.contrib.auth import authenticate
from django.http import JsonResponse
from accounts.models import UserProfile
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def user_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    username = request.POST.get("username")
    password = request.POST.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    try:
        profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)

    if not profile.approved:
        return JsonResponse({
            "approved": False,
            "message": "Waiting for admin approval"
        })

    return JsonResponse({
        "approved": True,
        "username": user.username,
        "goal": profile.goal,
        "message": "Login successful"
    })
@csrf_exempt
def create_trainer(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    username = request.POST.get("username")
    password = request.POST.get("password")
    trainer_id = request.POST.get("trainer_id")

    if not username or not password or not trainer_id:
        return JsonResponse({"error": "Missing data"}, status=400)

    try:
        user = User.objects.get(username=username)
        profile = UserProfile.objects.get(user=user)
    except (User.DoesNotExist, UserProfile.DoesNotExist):
        return JsonResponse({"error": "User not found"}, status=404)

    # 🔑 ALWAYS RESET PASSWORD (CRITICAL)
    user.set_password(password)
    user.save()

    # 🔑 FORCE TRAINER CREATION / UPDATE (NO get_or_create)
    trainer, created = Trainer.objects.update_or_create(
        user=user,
        defaults={"trainer_id": trainer_id}
    )

    # 🔑 FORCE ASSIGNMENT
    profile.trainer = trainer
    profile.approved = True
    profile.save()

    return JsonResponse(
        {"message": "Trainer created, updated, and assigned successfully"},
        status=201
    )

def trainer_users(request):
    trainer_username = request.GET.get("trainer")

    if not trainer_username:
        return JsonResponse({"error": "Trainer username required"}, status=400)

    try:
        trainer = Trainer.objects.get(user__username=trainer_username)
    except Trainer.DoesNotExist:
        return JsonResponse({"error": "Trainer not found"}, status=404)

    profiles = UserProfile.objects.filter(trainer=trainer)

    users = []
    for p in profiles:
        users.append({
            "username": p.user.username,
            "goal": p.goal,
        })

    return JsonResponse({"users": users})
from django.contrib.auth import authenticate
from django.http import JsonResponse
from .models import Trainer, UserProfile
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def trainer_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    trainer_id = request.POST.get("trainer_id")
    password = request.POST.get("password")

    if not trainer_id or not password:
        return JsonResponse({"error": "Missing credentials"}, status=400)

    try:
        trainer = Trainer.objects.get(trainer_id=trainer_id)
    except Trainer.DoesNotExist:
        return JsonResponse({"error": "Invalid trainer ID"}, status=401)

    user = authenticate(
        username=trainer.user.username,
        password=password
    )

    if user is None:
        return JsonResponse({"error": "Invalid password"}, status=401)

    return JsonResponse({
        "message": "Trainer login successful",
        "trainer_id": trainer.trainer_id,
        "username": user.username
    })
def trainer_dashboard(request):
    trainer_id = request.GET.get("trainer_id")

    if not trainer_id:
        return JsonResponse({"error": "Trainer ID required"}, status=400)

    try:
        trainer = Trainer.objects.get(trainer_id=trainer_id)
    except Trainer.DoesNotExist:
        return JsonResponse({"error": "Trainer not found"}, status=404)

    users = UserProfile.objects.filter(
        trainer=trainer,
        approved=True
    )

    data = []
    for u in users:
        data.append({
            "username": u.user.username,
            "age": u.age,
            "goal": u.goal
        })

    return JsonResponse({"users": data})
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Trainer, UserProfile, DailyUpdate
from django.contrib.auth.models import User
from datetime import datetime

@csrf_exempt
def add_daily_update(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    trainer_id = request.POST.get("trainer_id")
    username = request.POST.get("username")
    date = request.POST.get("date")
    diet = request.POST.get("diet")
    attendance = request.POST.get("attendance")
    description = request.POST.get("description")

    try:
        trainer = Trainer.objects.get(trainer_id=trainer_id)
        user = User.objects.get(username=username)
    except:
        return JsonResponse({"error": "Invalid trainer or user"}, status=400)

    DailyUpdate.objects.create(
        trainer=trainer,
        user=user,
        date=date,
        diet=diet,
        attendance=True if attendance == "true" else False,
        description=description
    )

    return JsonResponse({"message": "Daily update added"}, status=201)
from django.db.models import Count

def user_updates(request):
    username = request.GET.get("username")

    try:
        user = User.objects.get(username=username)
    except:
        return JsonResponse({"error": "User not found"}, status=404)

    updates = DailyUpdate.objects.filter(user=user).order_by("-date")

    data = []
    for u in updates:
        data.append({
            "date": u.date,
            "diet": u.diet,
            "attendance": u.attendance,
            "description": u.description
        })

    monthly_count = updates.filter(attendance=True).count()

    return JsonResponse({
        "updates": data,
        "present_days": monthly_count
    })
