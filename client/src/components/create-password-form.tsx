import { useState } from "react";
import { predefinedServices } from "@/lib/services";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Copy, Share2, Plus, Trash, Shield, Download } from "lucide-react";
import { 
  createPasswordSchema, 
  serviceSchema,
  type CreatePasswordForm, 
  type ServiceData 
} from "@shared/schema";
import { generateSpecialFormatPassword } from "@/lib/password-generator";
import { downloadAsTextFile } from "@/lib/download-utils";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordGeneratorForm from "@/components/password-generator-form";
import PasswordStrengthMeter from "@/components/password-strength-meter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CreatePasswordForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState<{[key: number]: boolean}>({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareInfo, setShareInfo] = useState({
    serviceName: "",
    username: ""
  });
  const [createdEntries, setCreatedEntries] = useState<any[]>([]);
  const [shareComment, setShareComment] = useState<string>("");
  const [customServiceNames, setCustomServiceNames] = useState<{[key: number]: string}>({});
  const [selectedServices, setSelectedServices] = useState<{[key: number]: string}>({});
  
  const form = useForm<CreatePasswordForm>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      services: [
        {
          serviceName: "",
          serviceUrl: "",
          username: "",
          password: ""
        }
      ]
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services"
  });

  // Create password entries and share in one batch request
  const createPasswordBatchMutation = useMutation({
    mutationFn: async (data: CreatePasswordForm) => {
      // Используем новый batch endpoint для создания всех паролей и ссылки одновременно
      const res = await apiRequest("POST", "/api/passwords/batch", {
        services: data.services,
        recipientEmail: "user@example.com", // Требуется API, но не будет использоваться для отправки email
        comment: data.comment
      });
      return res.json();
    },
    onSuccess: (result) => {
      // Результат содержит entries (записи паролей) и share (ссылку)
      if (result.share && result.entries && result.entries.length > 0) {
        // Генерируем URL для ссылки
        const url = `${window.location.origin}/view/${result.share.shareToken}`;
        const firstEntry = result.entries[0];
        
        // Сохраняем данные для скачивания
        setCreatedEntries(result.entries);
        const formData = form.getValues();
        setShareComment(formData.comment || "");
        
        // Устанавливаем состояние для диалога
        setShareUrl(url);
        setShareInfo({
          serviceName: firstEntry.serviceName,
          username: firstEntry.username
        });
        
        // Открываем диалог со ссылкой
        setShareDialogOpen(true);
        
        // Копируем в буфер обмена
        navigator.clipboard.writeText(url).catch(console.error);
      } else {
        toast({
          title: "Предупреждение",
          description: "Пароли созданы, но не удалось создать ссылку для общего доступа",
          variant: "destructive",
        });
      }
      
      // Сбрасываем форму
      form.reset({
        services: [
          {
            serviceName: "",
            serviceUrl: "",
            username: "",
            password: ""
          }
        ]
      });
      
      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать пароли: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: CreatePasswordForm) => {
    if (!user) return;
    
    // Используем новый batch метод
    createPasswordBatchMutation.mutate(data);
  };
  
  // Handle password generation for a specific service
  const handlePasswordGeneration = (generatedPassword: string, index: number) => {
    form.setValue(`services.${index}.password`, generatedPassword);
  };
  
  // Handle toggle password visibility
  const togglePasswordVisibility = (index: number) => {
    setShowPassword(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Add a new service
  const addService = () => {
    append({
      serviceName: "",
      serviceUrl: "",
      username: "",
      password: ""
    });
  };
  
  // Function to handle copying of the share URL
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl).catch(console.error);
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка скопирована в буфер обмена",
    });
  };

  // Function to download data as text file
  const handleDownloadData = () => {
    if (createdEntries.length > 0) {
      const services = createdEntries.map(entry => ({
        serviceName: entry.serviceName,
        serviceUrl: entry.serviceUrl,
        username: entry.username,
        password: entry.password
      }));
      
      downloadAsTextFile(
        services, 
        shareComment || undefined, 
        `access-data-${new Date().toISOString().split('T')[0]}.txt`
      );
      
      toast({
        title: "Файл скачан",
        description: "Данные доступа сохранены в текстовый файл",
      });
    }
  };

  return (
    <>
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ссылка для доступа создана</DialogTitle>
            <DialogDescription>
              Используйте эту ссылку, чтобы поделиться доступом к {shareInfo.serviceName} ({shareInfo.username}).
              Срок действия ссылки - 1 час.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="font-mono text-sm"
              />
            </div>
            <Button type="button" size="sm" onClick={copyShareUrl}>
              <Copy className="h-4 w-4 mr-1" />
              Копировать
            </Button>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" onClick={() => setShareDialogOpen(false)}>
              Готово
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg mb-6 relative">
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <FormField
                  control={form.control}
                  name={`services.${index}.serviceName`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Название сервиса</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <select
                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                            value={selectedServices[index] || ""}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              setSelectedServices(prev => ({ ...prev, [index]: selectedValue }));
                              
                              if (selectedValue === "Другое") {
                                // Очищаем URL и готовимся к вводу кастомного названия
                                form.setValue(`services.${index}.serviceUrl`, "");
                                setCustomServiceNames(prev => ({ ...prev, [index]: "" }));
                                // Очищаем поле формы для названия сервиса
                                field.onChange("");
                                return;
                              }
                              
                              // Убираем кастомное название если выбрали предустановленный сервис
                              setCustomServiceNames(prev => {
                                const newState = { ...prev };
                                delete newState[index];
                                return newState;
                              });
                              
                              field.onChange(selectedValue);
                              
                              const service = predefinedServices.find(s => s.name === selectedValue);
                              if (service) {
                                form.setValue(`services.${index}.serviceUrl`, service.url || "");
                              }
                              
                              // Если выбрана почта, генерируем специальный пароль
                              if (service?.name === "Почта") {
                                const specialPassword = generateSpecialFormatPassword();
                                form.setValue(`services.${index}.password`, specialPassword);
                              }
                            }}
                          >
                            <option value="">Выберите сервис...</option>
                            {predefinedServices.map(service => (
                              <option key={service.name} value={service.name}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                          {selectedServices[index] === "Другое" && (
                            <Input
                              placeholder="Введите название сервиса"
                              value={customServiceNames[index] || ""}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setCustomServiceNames(prev => ({ ...prev, [index]: newValue }));
                                field.onChange(newValue);
                              }}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`services.${index}.serviceUrl`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>URL сервиса</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
                          value={field.value || ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`services.${index}.username`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Имя пользователя</FormLabel>
                      <FormControl>
                        <Input placeholder="username@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`services.${index}.password`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Пароль</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword[index] ? "text" : "password"}
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                          onClick={() => togglePasswordVisibility(index)}
                        >
                          {showPassword[index] ? (
                            <EyeOff className="h-5 w-5 text-neutral-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-neutral-500" />
                          )}
                        </button>
                      </div>
                      <PasswordStrengthMeter password={field.value} className="mt-2" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <div>
                  <FormLabel className="block text-sm font-medium text-neutral-700">
                    Генератор паролей
                  </FormLabel>
                  
                  {index === 0 && (
                    <div className="mt-2 mb-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center text-sm"
                        onClick={() => {
                          const specialPassword = generateSpecialFormatPassword();
                          handlePasswordGeneration(specialPassword, 0);
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2 text-primary-600" />
                        Сгенерировать специальный пароль (3 строчные + 4 цифры + 3 прописные + спецсимвол)
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-1">
                    <PasswordGeneratorForm onGenerate={(password) => handlePasswordGeneration(password, index)} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Поле комментария */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Комментарий для пользователя (необязательно)</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Добавьте комментарий для пользователя (например, инструкции по использованию пароля)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={addService}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить сервис
            </Button>
            
            <Button
              type="submit"
              disabled={createPasswordBatchMutation.isPending}
            >
              Создать и поделиться
            </Button>
          </div>
        </form>
      </Form>

      {/* Dialog for sharing URL */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-green-600" />
              Ссылка для доступа создана
            </DialogTitle>
            <DialogDescription>
              Ваша ссылка готова! Пароль для сервиса "{shareInfo.serviceName}" (пользователь: {shareInfo.username}) создан.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <label htmlFor="link" className="sr-only">
                Ссылка
              </label>
              <input
                id="link"
                defaultValue={shareUrl}
                readOnly
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm bg-neutral-50"
              />
            </div>
            <Button type="button" size="sm" className="px-3" onClick={copyShareUrl}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadData}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать данные
            </Button>
            <Button onClick={() => setShareDialogOpen(false)}>
              Готово
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}