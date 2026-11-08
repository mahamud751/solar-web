import type { Category, Product, User } from "@prisma/client";
import { Save, UserPlus } from "lucide-react";
import { DISTRICTS } from "@/lib/constants";
import { ImageField } from "@/components/admin/ImageField";

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  product?: Product;
}) {
  return (
    <form action={action} className="adminForm">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="currentImage" value={product?.image ?? ""} />
      <label>
        Name
        <input name="name" required defaultValue={product?.name ?? ""} />
      </label>
      <label>
        Slug
        <input name="slug" defaultValue={product?.slug ?? ""} placeholder="Leave blank to generate" />
      </label>
      <label>
        Brand
        <input name="brand" required defaultValue={product?.brand ?? ""} />
      </label>
      <label>
        Power
        <input name="power" required defaultValue={product?.power ?? ""} placeholder="200W" />
      </label>
      <label>
        Category
        <select name="categoryId" required defaultValue={product?.categoryId ?? ""}>
          <option value="" disabled>
            Select category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Price (BDT)
        <input name="price" inputMode="numeric" defaultValue={product?.price ?? ""} placeholder="8500" />
      </label>
      <label>
        Stock
        <input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} />
      </label>
      <label>
        Warranty
        <input name="warranty" defaultValue={product?.warranty ?? ""} />
      </label>
      <div className="checkRow">
        <label className="check">
          <input type="checkbox" name="callForPrice" defaultChecked={product?.callForPrice ?? false} />
          <span>Call for price</span>
        </label>
        <label className="check">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          <span>Visible in the shop</span>
        </label>
        <label className="check">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          <span>Featured</span>
        </label>
      </div>
      <label className="wide">
        Description
        <textarea name="description" rows={4} required defaultValue={product?.description ?? ""} />
      </label>
      <label className="wide">
        Features, one per line
        <textarea name="features" rows={5} defaultValue={product?.features ?? ""} />
      </label>
      <ImageField current={product?.image} />
      <button className="iconBtn solid">
        <Save size={16} /> {product ? "Save product" : "Create product"}
      </button>
    </form>
  );
}

export function UserForm({
  action,
  user,
}: {
  action: (formData: FormData) => Promise<void>;
  user?: User;
}) {
  return (
    <form action={action} className="adminForm">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      <label>
        Name
        <input name="name" required defaultValue={user?.name ?? ""} />
      </label>
      <label>
        Email
        <input name="email" type="email" required defaultValue={user?.email ?? ""} />
      </label>
      <label>
        Mobile
        <input name="phone" required defaultValue={user?.phone ?? ""} pattern="01[3-9][0-9]{8}" />
      </label>
      <label>
        Role
        <select name="role" defaultValue={user?.role ?? "CUSTOMER"}>
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      <label>
        District
        <select name="district" defaultValue={user?.district ?? ""}>
          <option value="">Select district</option>
          {DISTRICTS.map((district) => (
            <option key={district}>{district}</option>
          ))}
        </select>
      </label>
      <label className="wide">
        Address
        <textarea name="address" rows={3} defaultValue={user?.address ?? ""} />
      </label>
      <label className="wide">
        {user ? "New password (optional)" : "Password"}
        <input name="password" type="password" required={!user} minLength={user ? undefined : 8} autoComplete="new-password" />
      </label>
      <button className="iconBtn solid">
        {user ? <Save size={16} /> : <UserPlus size={16} />} {user ? "Save user" : "Create user"}
      </button>
    </form>
  );
}
