import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Tags, Plus, Edit2, Trash2, GripVertical, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminCategories, Category } from "@/hooks/useAdminCategories";
import { useToast } from "@/hooks/use-toast";

const AdminCategoriesPage = () => {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useAdminCategories();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setCurrentCategory({
      name: "",
      slug: "",
      active: true,
      order: categories.length + 1,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!currentCategory.name || !currentCategory.slug) {
      toast({ title: "Validation Error", description: "Name and slug are required.", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      if (currentCategory.id) {
        await updateCategory(currentCategory.id, currentCategory);
        toast({ title: "Success", description: "Category updated successfully." });
        setIsEditOpen(false);
      } else {
        await addCategory(currentCategory as Omit<Category, 'id' | 'createdAt'>);
        toast({ title: "Success", description: "Category created successfully." });
        setIsAddOpen(false);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        toast({ title: "Success", description: "Category deleted." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateCategory(id, { active: !currentActive });
      toast({ title: "Status Updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Split into main categories and subcategories
  const mainCategories = categories.filter(c => !c.parentId);
  
  const CategoryForm = () => (
    <div className="space-y-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={currentCategory.name || ""} 
          onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})} 
          placeholder="e.g. Restaurants"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Slug (URL friendly)</Label>
        <Input 
          id="slug" 
          value={currentCategory.slug || ""} 
          onChange={(e) => setCurrentCategory({...currentCategory, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} 
          placeholder="e.g. restaurants"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="parent">Parent Category (Optional)</Label>
        <select 
          id="parent"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={currentCategory.parentId || ""}
          onChange={(e) => setCurrentCategory({...currentCategory, parentId: e.target.value || undefined})}
        >
          <option value="">None (Top Level)</option>
          {mainCategories.map(c => (
            c.id !== currentCategory.id && (
              <option key={c.id} value={c.id}>{c.name}</option>
            )
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="order">Display Order</Label>
        <Input 
          id="order" 
          type="number"
          value={currentCategory.order || 0} 
          onChange={(e) => setCurrentCategory({...currentCategory, order: parseInt(e.target.value) || 0})} 
        />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch 
          id="active" 
          checked={currentCategory.active || false}
          onCheckedChange={(checked) => setCurrentCategory({...currentCategory, active: checked})}
        />
        <Label htmlFor="active">Active (visible to users)</Label>
      </div>
      <Button className="w-full mt-4" onClick={handleSave} disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Category"}
      </Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Categories & Services | Admin | BusinessHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Tags className="h-8 w-8 text-primary" />
            Categories & Services
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the platform taxonomy and business categories
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-16 text-center">
              <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No categories found</h2>
              <p className="text-muted-foreground mb-4">Create your first category to organize businesses.</p>
              <Button onClick={handleOpenAdd} variant="outline">Add Category</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    </TableCell>
                    <TableCell>
                      <span className={category.parentId ? "pl-4 text-muted-foreground flex items-center gap-2" : "font-medium"}>
                        {category.parentId && <div className="w-2 h-px bg-border"></div>}
                        {category.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      {category.parentId ? (
                        <Badge variant="outline">Subcategory</Badge>
                      ) : (
                        <Badge variant="secondary">Main</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={category.active}
                        onCheckedChange={() => toggleActive(category.id, category.active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={isEditOpen && currentCategory.id === category.id} onOpenChange={(open) => !open && setIsEditOpen(false)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(category)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                            </DialogHeader>
                            <CategoryForm />
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AdminCategoriesPage;
