import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Minicourse } from '@/types';

const MinicourseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Minicourse>>({
    title: '',
    description: '',
    instructor: '',
    location: '',
    date: 'A definir',
    time: 'A definir',
    vacancies: 0,
    vacancies_left: 0,
    type: '',
    theme: '',
    price: 0,
    image_url: '',
    is_published: false,
    instructor_photo_url: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [instructorImageFile, setInstructorImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewInstructorImage, setPreviewInstructorImage] = useState<string>('');

  const isEditMode = !!id;

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
      return;
    }

    // If in edit mode, fetch minicourse data
    if (user && isEditMode) {
      fetchMinicourse();
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthLoading, id]);

  const fetchMinicourse = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('minicourses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Minicurso não encontrado');
        navigate('/admin/minicourses');
        return;
      }

      setFormData(data);
      setPreviewImage(data.image_url || '');
      setPreviewInstructorImage(data.instructor_photo_url || '');
    } catch (error: any) {
      console.error('Erro ao carregar minicurso:', error);
      toast.error('Erro ao carregar minicurso');
      navigate('/admin/minicourses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'vacancies' || name === 'vacancies_left') {
      // If it's a new minicourse, keep vacancies_left in sync with vacancies
      const numValue = parseInt(value) || 0;
      if (name === 'vacancies' && !isEditMode) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: numValue,
          vacancies_left: numValue
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_published: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstructorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInstructorImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewInstructorImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('minicourses')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('minicourses')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const validateForm = (): boolean => {
    const requiredFields = ['vacancies', 'price'] as (keyof Minicourse)[];
    const missingFields = requiredFields.filter(field => 
      !formData[field] && formData[field] !== 0
    );

    if (missingFields.length > 0) {
      toast.error(`Por favor, preencha os campos obrigatórios: ${missingFields.join(', ')}`);
      return false;
    }

    if (formData.vacancies && formData.vacancies <= 0) {
      toast.error('O número de vagas deve ser maior que zero');
      return false;
    }

    if (formData.price && formData.price <= 0) {
      toast.error('O preço deve ser maior que zero');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();

      let imageUrl = formData.image_url;
      let instructorPhotoUrl = formData.instructor_photo_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'images');
      }

      if (instructorImageFile) {
        instructorPhotoUrl = await uploadImage(instructorImageFile, 'instructors');
      }

      const submissionData = {
        ...formData,
        updated_at: now,
        published_at: formData.is_published ? (formData.published_at || now) : null,
        image_url: imageUrl,
        instructor_photo_url: instructorPhotoUrl,
      };

      let result;
      if (isEditMode) {
        result = await supabase
          .from('minicourses')
          .update(submissionData)
          .eq('id', id)
          .select()
          .single();
      } else {
        submissionData.created_at = now;
        result = await supabase
          .from('minicourses')
          .insert([submissionData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(`Minicurso ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
      navigate('/admin/minicourses');
    } catch (error: any) {
      console.error('Erro ao salvar minicurso:', error);
      toast.error(error.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} minicurso`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || (isLoading && isEditMode)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/admin/minicourses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? 'Editar' : 'Novo'} Minicurso</CardTitle>
              <CardDescription>
                {isEditMode 
                  ? 'Edite as informações do minicurso' 
                  : 'Preencha o formulário para criar um novo minicurso'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Título do minicurso"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descrição detalhada do minicurso"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instructor">Ministrante</Label>
                      <Input
                        id="instructor"
                        name="instructor"
                        value={formData.instructor}
                        onChange={handleInputChange}
                        placeholder="Nome do ministrante"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructor_photo_url">Foto do Ministrante</Label>
                      <Input
                        id="instructor_photo_url"
                        name="instructor_photo_url"
                        value={formData.instructor_photo_url}
                        onChange={handleInputChange}
                        placeholder="URL da foto do ministrante"
                      />
                      {previewInstructorImage && (
                        <div className="mt-2">
                          <p className="text-sm mb-1">Pré-visualização:</p>
                          <div className="w-16 h-16 overflow-hidden rounded-full border bg-muted">
                            <img
                              src={previewInstructorImage}
                              alt="Foto do ministrante"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error('Erro ao carregar imagem:', previewInstructorImage);
                                e.currentTarget.src = 'https://placehold.co/100x100/png?text=Foto+inválida';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Local do minicurso"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        placeholder="Data do minicurso ou 'A definir'"
                      />
                    </div>

                    <div>
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        placeholder="Horário do minicurso ou 'A definir'"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="vacancies" className="required-field">Total de Vagas</Label>
                      <Input
                        id="vacancies"
                        name="vacancies"
                        type="number"
                        min="1"
                        value={formData.vacancies}
                        onChange={handleInputChange}
                        placeholder="Número total de vagas"
                        required
                      />
                    </div>

                    {isEditMode && (
                      <div>
                        <Label htmlFor="vacancies_left">Vagas Disponíveis</Label>
                        <Input
                          id="vacancies_left"
                          name="vacancies_left"
                          type="number"
                          min="0"
                          max={formData.vacancies}
                          value={formData.vacancies_left}
                          onChange={handleInputChange}
                          placeholder="Vagas ainda disponíveis"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="price" className="required-field">Preço (R$)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Preço do minicurso em reais"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Input
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        placeholder="Tipo de minicurso (ex: Teórico, Prático)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="theme">Tema</Label>
                      <Input
                        id="theme"
                        name="theme"
                        value={formData.theme}
                        onChange={handleInputChange}
                        placeholder="Tema do minicurso"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Imagem do Minicurso</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {previewImage && (
                      <div className="mt-2">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructorImage">Foto do Instrutor</Label>
                    <Input
                      id="instructorImage"
                      type="file"
                      accept="image/*"
                      onChange={handleInstructorImageChange}
                    />
                    {previewInstructorImage && (
                      <div className="mt-2">
                        <img
                          src={previewInstructorImage}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={handleToggleChange}
                    />
                    <Label htmlFor="is_published">
                      {formData.is_published ? 'Publicado' : 'Rascunho'}
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/minicourses')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MinicourseForm; 