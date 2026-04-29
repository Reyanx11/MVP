from fastapi import APIRouter,HTTPException,Depends
from app.schemas import UserCreate,UserResponse,Token,UserLogin
from app.models import User
from app.database import get_db
from sqlalchemy.orm import Session
from app.auth import hashed_pwd,verify_pwd,create_access_token,decode_access_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth",tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

##  HELPER FUNCTIONS ##

# get users
def get_current_user(token:str = Depends(oauth2_scheme), db:Session = Depends(get_db)):
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code= 401, detail = "Invalid or expired token")
    
    username = payload.get("sub")

    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code= 401, detail ="User not found")
    
    return user

# check if current user is admin or not

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail= "Admin access required")
    
    return current_user

#### REGISTRATION ROUTE  #####
@router.post("/register",response_model=UserResponse)
def register(user:UserCreate, db:Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()

    if existing_user:
        raise HTTPException(status_code= 400, detail = "Username already taken")
    
    new_user = User(
        username = user.username,
        hashed_password = hashed_pwd(user.password),
        role = user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

### LOGIN ROUTE ####

@router.post("/login",response_model=Token)
def login(user: UserLogin, db:Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()

    if not db_user:
        raise HTTPException(status_code=401, detail= "Invalid username or password")
    
    if not verify_pwd(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail= "Invalid username or password")


    token = create_access_token({
        "sub": db_user.username,
        "role": db_user.role
    })

    return {
        "access_token": token,
        "token_type":"bearer"
    }

@router.get("/me",response_model=UserResponse)
def get_me(current_user:User = Depends(get_current_user)):
    return current_user
    